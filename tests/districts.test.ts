import { describe, it, expect } from "vitest";
import { Effect, Stream, Chunk } from "effect";
import { listDistricts, fetchDistrict, listDistrictAdministrators } from "../src/api/v2/districts.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { makeTestHttpClient, type MockHandler } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";
import { districtFixture, districtFixture2, districtFixture3, personFixture, personFixture2 } from "./helpers/fixtures.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DIST = "dist-100";
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
// fetchDistrict
// ============================================================================

describe("fetchDistrict", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => { req = r; return single(districtFixture); });
    const result = await run(fetchDistrict(testConfig, client, DIST));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/districts/${DIST}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("dist-001");
    expect(result.name).toBe("Springfield USD");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchDistrict(testConfig, makeTestHttpClient(() => fail(404)), DIST));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchDistrict(testConfig, makeTestHttpClient(() => single({ id: "x" })), DIST),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listDistricts
// ============================================================================

describe("listDistricts", () => {
  it("streams items across pages", async () => {
    const empty = await collect(
      listDistricts(testConfig, makeTestHttpClient(() => page([])), { type: "all" }),
    );
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([districtFixture], `${BASE}/next?cursor=p2`) : page([districtFixture2]);
    };
    const items = await collect(listDistricts(testConfig, makeTestHttpClient(multi), { type: "all" }));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listDistricts(testConfig, makeTestHttpClient(() => {
        pc++;
        return page([{ ...districtFixture, id: `d-${pc}` }], `${BASE}/next?p=${pc + 1}`);
      }), { type: "pages", maxPages: 2 }),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listDistricts(testConfig, makeTestHttpClient(() => {
        rc++;
        return page(
          [{ ...districtFixture, id: `r-${rc}a` }, { ...districtFixture2, id: `r-${rc}b` }, { ...districtFixture3, id: `r-${rc}c` }],
          `${BASE}/next?p=${rc + 1}`,
        );
      }), { type: "records", maxRecords: 5 }),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err = await collectFail(listDistricts(testConfig, makeTestHttpClient(() => fail(500)), { type: "all" }));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listDistricts(testConfig, makeTestHttpClient(() => page([{ id: "bad" }])), { type: "all" }),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listDistrictAdministrators (nested)
// ============================================================================

describe("listDistrictAdministrators", () => {
  it("streams administrators for a district", async () => {
    let req: any;
    const items = await collect(
      listDistrictAdministrators(testConfig, makeTestHttpClient((r) => { req = r; return page([personFixture, personFixture2]); }), DIST, { type: "all" }),
    );
    expect(req.url).toContain(`/districts/${DIST}/administrators`);
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("per-001");
  });
});
