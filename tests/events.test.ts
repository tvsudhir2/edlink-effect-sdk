import { Chunk, Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";
import { createEventsStream } from "../src/api/v2/events.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { eventFixture, eventFixture2, eventFixture3 } from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = testConfig.apiBaseUrl;

const run = <A, E>(e: Effect.Effect<A, E>) => Effect.runPromise(e as Effect.Effect<A, never>);
const collect = <A, E>(s: Stream.Stream<A, E>) => run(Stream.runCollect(s).pipe(Effect.map(Chunk.toReadonlyArray)));
const collectFail = <A, E>(s: Stream.Stream<A, E>) => Effect.runPromise(Effect.flip(Stream.runCollect(s)));

const fail = (status: number) => ({ status, body: { error: "err" } });
const page = (data: unknown[], next: string | null = null) => ({ status: 200, body: { $data: data, $next: next } });

// ============================================================================
// createEventsStream (paginated stream)
// ============================================================================

describe("createEventsStream", () => {
  it("streams events across pages; returns empty for no data", async () => {
    const empty = await collect(
      createEventsStream(
        testConfig,
        makeTestHttpClient(() => page([])),
        { type: "all" },
      ),
    );
    expect(empty).toHaveLength(0);

    const items = await collect(
      createEventsStream(
        testConfig,
        makeTestHttpClient(() => page([eventFixture, eventFixture2])),
        { type: "all" },
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
    const multiItems = await collect(createEventsStream(testConfig, makeTestHttpClient(multi), { type: "all" }));
    expect(multiItems).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords pagination limits", async () => {
    let pc = 0;
    const byPages = await collect(
      createEventsStream(
        testConfig,
        makeTestHttpClient(() => {
          pc++;
          return page([{ ...eventFixture, id: `e-${pc}` }], `${BASE}/next?p=${pc + 1}`);
        }),
        { type: "pages", maxPages: 2 },
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      createEventsStream(
        testConfig,
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
        { type: "records", maxRecords: 5 },
      ),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err500 = await collectFail(
      createEventsStream(
        testConfig,
        makeTestHttpClient(() => fail(500)),
        { type: "all" },
      ),
    );
    expect(err500).toBeInstanceOf(EdlinkApiError);

    // Event schema only requires id + type, so send something completely wrong
    const errDecode = await collectFail(
      createEventsStream(
        testConfig,
        makeTestHttpClient(() => page([{ noId: true }])),
        { type: "all" },
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
