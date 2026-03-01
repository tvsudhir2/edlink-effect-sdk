import { describe, expect, it } from "vitest";
import { fetchAgent, listAgents } from "@/api/v2/agents.js";
import { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import { agentFixture, agentFixture2, agentFixture3 } from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";
import { makeCtx } from "./helpers/test-config.js";
import { BASE, collect, collectFail, fail, page, run, runFail, single } from "./helpers/test-utils.js";

// ============================================================================
// fetchAgent
// ============================================================================

describe("fetchAgent", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(agentFixture);
    });
    const result = await run(fetchAgent("agent-001", makeCtx(client)));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/agents/agent-001`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("agent-001");
    expect(result.relationship).toBe("parent");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchAgent("x", makeCtx(makeTestHttpClient(() => fail(404)))));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(fetchAgent("x", makeCtx(makeTestHttpClient(() => single({ id: "x" })))));
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listAgents (paginated stream)
// ============================================================================

describe("listAgents", () => {
  it("streams items across pages; returns empty for no data", async () => {
    const empty = await collect(listAgents({ type: "all" }, makeCtx(makeTestHttpClient(() => page([])))));
    expect(empty).toHaveLength(0);

    const items = await collect(
      listAgents({ type: "all" }, makeCtx(makeTestHttpClient(() => page([agentFixture, agentFixture2])))),
    );
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("agent-001");

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([agentFixture], `${BASE}/next?cursor=p2`) : page([agentFixture2]);
    };
    const multiItems = await collect(listAgents({ type: "all" }, makeCtx(makeTestHttpClient(multi))));
    expect(multiItems).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords pagination limits", async () => {
    let pc = 0;
    const byPages = await collect(
      listAgents(
        { type: "pages", maxPages: 2 },
        makeCtx(
          makeTestHttpClient(() => {
            pc++;
            return page([{ ...agentFixture, id: `a-${pc}` }], `${BASE}/next?p=${pc + 1}`);
          }),
        ),
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listAgents(
        { type: "records", maxRecords: 5 },
        makeCtx(
          makeTestHttpClient(() => {
            rc++;
            return page(
              [
                { ...agentFixture, id: `r-${rc}a` },
                { ...agentFixture2, id: `r-${rc}b` },
                { ...agentFixture3, id: `r-${rc}c` },
              ],
              `${BASE}/next?p=${rc + 1}`,
            );
          }),
        ),
      ),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err500 = await collectFail(listAgents({ type: "all" }, makeCtx(makeTestHttpClient(() => fail(500)))));
    expect(err500).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listAgents({ type: "all" }, makeCtx(makeTestHttpClient(() => page([{ id: "bad" }])))),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
