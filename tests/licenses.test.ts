import { Chunk, Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";
import { listLicenses } from "../src/api/v2/licenses.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { licenseFixture, licenseFixture2, licenseFixture3 } from "./helpers/fixtures.js";
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
// listLicenses (paginated stream — list only, no fetch)
// ============================================================================

describe("listLicenses", () => {
  it("streams items across pages; returns empty for no data", async () => {
    const empty = await collect(
      listLicenses(
        testConfig,
        makeTestHttpClient(() => page([])),
        { type: "all" },
      ),
    );
    expect(empty).toHaveLength(0);

    const items = await collect(
      listLicenses(
        testConfig,
        makeTestHttpClient(() => page([licenseFixture, licenseFixture2])),
        { type: "all" },
      ),
    );
    expect(items).toHaveLength(2);
    expect(items[0]!.product_id).toBe("prod-001");
    expect(items[0]!.class_count).toBe(10);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([licenseFixture], `${BASE}/next?cursor=p2`) : page([licenseFixture2]);
    };
    const multiItems = await collect(listLicenses(testConfig, makeTestHttpClient(multi), { type: "all" }));
    expect(multiItems).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords pagination limits", async () => {
    let pc = 0;
    const byPages = await collect(
      listLicenses(
        testConfig,
        makeTestHttpClient(() => {
          pc++;
          return page([{ ...licenseFixture, product_id: `p-${pc}` }], `${BASE}/next?p=${pc + 1}`);
        }),
        { type: "pages", maxPages: 2 },
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listLicenses(
        testConfig,
        makeTestHttpClient(() => {
          rc++;
          return page(
            [
              { ...licenseFixture, product_id: `r-${rc}a` },
              { ...licenseFixture2, product_id: `r-${rc}b` },
              { ...licenseFixture3, product_id: `r-${rc}c` },
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
      listLicenses(
        testConfig,
        makeTestHttpClient(() => fail(500)),
        { type: "all" },
      ),
    );
    expect(err500).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listLicenses(
        testConfig,
        makeTestHttpClient(() => page([{ bad: true }])),
        { type: "all" },
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
