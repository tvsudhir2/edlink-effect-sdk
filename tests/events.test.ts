import { describe, expect, it } from "vitest";
import { fetchEvent, listEvents } from "@/api/v2/events.js";
import { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import { eventFixture, eventFixture2, eventFixture3 } from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";
import { makeCtx } from "./helpers/test-config.js";
import { BASE, collect, collectFail, fail, page, run, runFail, single } from "./helpers/test-utils.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EVT = "evt-001";

// ============================================================================
// listEvents (paginated stream)
// ============================================================================

describe("listEvents", () => {
  it("streams events across pages; returns empty for no data", async () => {
    const empty = await collect(
      listEvents({ pagination: { type: "all" } }, makeCtx(makeTestHttpClient(() => page([])))),
    );
    expect(empty).toHaveLength(0);

    const items = await collect(
      listEvents(
        { pagination: { type: "all" } },
        makeCtx(makeTestHttpClient(() => page([eventFixture, eventFixture2]))),
      ),
    );
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("evt-001");
    expect(items[0]!.type).toBe("person.created");

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([eventFixture], `${BASE}/next?cursor=p2`) : page([eventFixture2]);
    };
    const multiItems = await collect(listEvents({ pagination: { type: "all" } }, makeCtx(makeTestHttpClient(multi))));
    expect(multiItems).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords pagination limits", async () => {
    let pc = 0;
    const byPages = await collect(
      listEvents(
        { pagination: { type: "pages", maxPages: 2 } },
        makeCtx(
          makeTestHttpClient(() => {
            pc++;
            return page([{ ...eventFixture, id: `e-${pc}` }], `${BASE}/next?p=${pc + 1}`);
          }),
        ),
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listEvents(
        { pagination: { type: "records", maxRecords: 5 } },
        makeCtx(
          makeTestHttpClient(() => {
            rc++;
            return page(
              [
                { ...eventFixture, id: `r-${rc}a` },
                { ...eventFixture2, id: `r-${rc}b` },
                { ...eventFixture3, id: `r-${rc}c` },
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
    const err500 = await collectFail(
      listEvents({ pagination: { type: "all" } }, makeCtx(makeTestHttpClient(() => fail(500)))),
    );
    expect(err500).toBeInstanceOf(EdlinkApiError);

    // Event schema only requires id + type, so send something completely wrong
    const errDecode = await collectFail(
      listEvents({ pagination: { type: "all" } }, makeCtx(makeTestHttpClient(() => page([{ noId: true }])))),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// fetchEvent
// ============================================================================

describe("fetchEvent", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(eventFixture);
    });
    const result = await run(fetchEvent({ eventId: EVT }, makeCtx(client)));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/events/${EVT}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe(eventFixture.id);
    expect(result.type).toBe("person.created");
  });

  it("returns EdlinkApiError on 4xx/5xx", async () => {
    const err404 = await runFail(fetchEvent({ eventId: EVT }, makeCtx(makeTestHttpClient(() => fail(404)))));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const err500 = await runFail(fetchEvent({ eventId: EVT }, makeCtx(makeTestHttpClient(() => fail(500)))));
    expect(err500).toBeInstanceOf(EdlinkApiError);
  });

  it("returns EdlinkDecodeError on bad data", async () => {
    const errDecode = await runFail(
      fetchEvent({ eventId: EVT }, makeCtx(makeTestHttpClient(() => single({ noId: true })))),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
