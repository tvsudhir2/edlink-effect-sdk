import { describe, it, expect } from "vitest";
import { Effect, Stream, Chunk } from "effect";
import { listAgents, fetchAgent } from "../src/api/v2/agents.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { makeTestHttpClient, type MockHandler } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";
import { agentFixture, agentFixture2, agentFixture3 } from "./helpers/fixtures.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = testConfig.apiBaseUrl;

const run = <A, E>(e: Effect.Effect<A, E>) => Effect.runPromise(e as Effect.Effect<A, never>);
const runFail = <A, E>(e: Effect.Effect<A, E>) => Effect.runPromise(Effect.flip(e));
const collect = <A, E>(s: Stream.Stream<A, E>) =>
  run(Stream.runCollect(s).pipe(Effect.map(Chunk.toReadonlyArray)));
const collectFail = <A, E>(s: Stream.Stream<A, E>) =>
  Effect.runPromise(Effect.flip(Stream.runCollect(s)));

const ok = (body: unknown) => ({ status: 200, body });
const fail = (status: number) => ({ status, body: { error: "err" } });
const single = (data: unknown) => ok({ $data: data });
const page = (data: unknown[], next: string | null = null) => ok({ $data: data, $next: next });

// ============================================================================
// fetchAgent
// ============================================================================

describe("fetchAgent", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => { req = r; return single(agentFixture); });
    const result = await run(fetchAgent(testConfig, client, "agent-001"));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/agents/agent-001`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("agent-001");
    expect(result.relationship).toBe("parent");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchAgent(testConfig, makeTestHttpClient(() => fail(404)), "x"));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchAgent(testConfig, makeTestHttpClient(() => single({ id: "x" })), "x"),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listAgents (paginated stream)
// ============================================================================

describe("listAgents", () => {
  it("streams items across pages; returns empty for no data", async () => {
    const empty = await collect(
      listAgents(testConfig, makeTestHttpClient(() => page([])), { type: "all" }),
    );
    expect(empty).toHaveLength(0);

    const items = await collect(
      listAgents(testConfig, makeTestHttpClient(() => page([agentFixture, agentFixture2])), { type: "all" }),
    );
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("agent-001");

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([agentFixture], `${BASE}/next?cursor=p2`) : page([agentFixture2]);
    };
    const multiItems = await collect(listAgents(testConfig, makeTestHttpClient(multi), { type: "all" }));
    expect(multiItems).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords pagination limits", async () => {
    let pc = 0;
    const byPages = await collect(
      listAgents(testConfig, makeTestHttpClient(() => {
        pc++;
        return page([{ ...agentFixture, id: `a-${pc}` }], `${BASE}/next?p=${pc + 1}`);
      }), { type: "pages", maxPages: 2 }),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listAgents(testConfig, makeTestHttpClient(() => {
        rc++;
        return page(
          [{ ...agentFixture, id: `r-${rc}a` }, { ...agentFixture2, id: `r-${rc}b` }, { ...agentFixture3, id: `r-${rc}c` }],
          `${BASE}/next?p=${rc + 1}`,
        );
      }), { type: "records", maxRecords: 5 }),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err500 = await collectFail(
      listAgents(testConfig, makeTestHttpClient(() => fail(500)), { type: "all" }),
    );
    expect(err500).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listAgents(testConfig, makeTestHttpClient(() => page([{ id: "bad" }])), { type: "all" }),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
