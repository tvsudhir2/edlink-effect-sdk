import { Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";
import { fetchDistrict, listDistrictAdministrators, listDistricts } from "../src/api/v2/districts.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import {
  districtFixture,
  districtFixture2,
  districtFixture3,
  personFixture,
  personFixture2,
} from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";
import { makeCtx, testConfig } from "./helpers/test-config.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DIST = "dist-100";
const BASE = testConfig.apiBaseUrl;

const run = <A, E>(e: Effect.Effect<A, E>) => Effect.runPromise(e as Effect.Effect<A, never>);
const runFail = <A, E>(e: Effect.Effect<A, E>) => Effect.runPromise(Effect.flip(e));
const collect = <A, E>(s: Stream.Stream<A, E>) => run(Stream.runCollect(s));
const collectFail = <A, E>(s: Stream.Stream<A, E>) => Effect.runPromise(Effect.flip(Stream.runCollect(s)));

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
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(districtFixture);
    });
    const result = await run(fetchDistrict(DIST, makeCtx(client)));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/districts/${DIST}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("dist-001");
    expect(result.name).toBe("Springfield USD");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchDistrict(DIST, makeCtx(makeTestHttpClient(() => fail(404)))));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(fetchDistrict(DIST, makeCtx(makeTestHttpClient(() => single({ id: "x" })))));
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listDistricts
// ============================================================================

describe("listDistricts", () => {
  it("streams items across pages", async () => {
    const empty = await collect(listDistricts({ type: "all" }, makeCtx(makeTestHttpClient(() => page([])))));
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([districtFixture], `${BASE}/next?cursor=p2`) : page([districtFixture2]);
    };
    const items = await collect(listDistricts({ type: "all" }, makeCtx(makeTestHttpClient(multi))));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listDistricts(
        { type: "pages", maxPages: 2 },
        makeCtx(
          makeTestHttpClient(() => {
            pc++;
            return page([{ ...districtFixture, id: `d-${pc}` }], `${BASE}/next?p=${pc + 1}`);
          }),
        ),
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listDistricts(
        { type: "records", maxRecords: 5 },
        makeCtx(
          makeTestHttpClient(() => {
            rc++;
            return page(
              [
                { ...districtFixture, id: `r-${rc}a` },
                { ...districtFixture2, id: `r-${rc}b` },
                { ...districtFixture3, id: `r-${rc}c` },
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
    const err = await collectFail(listDistricts({ type: "all" }, makeCtx(makeTestHttpClient(() => fail(500)))));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listDistricts({ type: "all" }, makeCtx(makeTestHttpClient(() => page([{ id: "bad" }])))),
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
      listDistrictAdministrators(
        { districtId: DIST, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([personFixture, personFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/districts/${DIST}/administrators`);
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("per-001");
  });
});
