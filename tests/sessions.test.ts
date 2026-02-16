import { describe, it, expect } from "vitest";
import { Effect, Stream, Chunk } from "effect";
import { listSessions, fetchSession } from "../src/api/v2/sessions.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { makeTestHttpClient, type MockHandler } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";
import { sessionFixture, sessionFixture2, sessionFixture3 } from "./helpers/fixtures.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SES = "ses-100";
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
// fetchSession
// ============================================================================

describe("fetchSession", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => { req = r; return single(sessionFixture); });
    const result = await run(fetchSession(testConfig, client, SES));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/sessions/${SES}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("ses-001");
    expect(result.name).toBe("Fall 2026");
    expect(result.type).toBe("semester");
    expect(result.state).toBe("upcoming");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchSession(testConfig, makeTestHttpClient(() => fail(404)), SES));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchSession(testConfig, makeTestHttpClient(() => single({ id: "x" })), SES),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listSessions
// ============================================================================

describe("listSessions", () => {
  it("streams items across pages", async () => {
    const empty = await collect(
      listSessions(testConfig, makeTestHttpClient(() => page([])), { type: "all" }),
    );
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([sessionFixture], `${BASE}/next?cursor=p2`) : page([sessionFixture2]);
    };
    const items = await collect(listSessions(testConfig, makeTestHttpClient(multi), { type: "all" }));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listSessions(testConfig, makeTestHttpClient(() => {
        pc++;
        return page([{ ...sessionFixture, id: `s-${pc}` }], `${BASE}/next?p=${pc + 1}`);
      }), { type: "pages", maxPages: 2 }),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listSessions(testConfig, makeTestHttpClient(() => {
        rc++;
        return page(
          [{ ...sessionFixture, id: `r-${rc}a` }, { ...sessionFixture2, id: `r-${rc}b` }, { ...sessionFixture3, id: `r-${rc}c` }],
          `${BASE}/next?p=${rc + 1}`,
        );
      }), { type: "records", maxRecords: 5 }),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err = await collectFail(listSessions(testConfig, makeTestHttpClient(() => fail(500)), { type: "all" }));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listSessions(testConfig, makeTestHttpClient(() => page([{ id: "bad" }])), { type: "all" }),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
