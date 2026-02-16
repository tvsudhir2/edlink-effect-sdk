import { Chunk, Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";
import { fetchCourse, listCourseClasses, listCourses } from "../src/api/v2/courses.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { classFixture, classFixture2, courseFixture, courseFixture2, courseFixture3 } from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CRS = "crs-100";
const BASE = testConfig.apiBaseUrl;

const run = <A, E>(e: Effect.Effect<A, E>) => Effect.runPromise(e as Effect.Effect<A, never>);
const runFail = <A, E>(e: Effect.Effect<A, E>) => Effect.runPromise(Effect.flip(e));
const collect = <A, E>(s: Stream.Stream<A, E>) => run(Stream.runCollect(s).pipe(Effect.map(Chunk.toReadonlyArray)));
const collectFail = <A, E>(s: Stream.Stream<A, E>) => Effect.runPromise(Effect.flip(Stream.runCollect(s)));

const ok = (body: unknown) => ({ status: 200, body });
const fail = (status: number) => ({ status, body: { error: "err" } });
const single = (data: unknown) => ok({ $data: data });
const page = (data: unknown[], next: string | null = null) => ok({ $data: data, $next: next });

// ============================================================================
// fetchCourse
// ============================================================================

describe("fetchCourse", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(courseFixture);
    });
    const result = await run(fetchCourse(testConfig, client, CRS));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/courses/${CRS}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("crs-001");
    expect(result.name).toBe("Mathematics");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(
      fetchCourse(
        testConfig,
        makeTestHttpClient(() => fail(404)),
        CRS,
      ),
    );
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchCourse(
        testConfig,
        makeTestHttpClient(() => single({ id: "x" })),
        CRS,
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listCourses
// ============================================================================

describe("listCourses", () => {
  it("streams items across pages", async () => {
    const empty = await collect(
      listCourses(
        testConfig,
        makeTestHttpClient(() => page([])),
        { type: "all" },
      ),
    );
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([courseFixture], `${BASE}/next?cursor=p2`) : page([courseFixture2]);
    };
    const items = await collect(listCourses(testConfig, makeTestHttpClient(multi), { type: "all" }));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listCourses(
        testConfig,
        makeTestHttpClient(() => {
          pc++;
          return page([{ ...courseFixture, id: `c-${pc}` }], `${BASE}/next?p=${pc + 1}`);
        }),
        { type: "pages", maxPages: 2 },
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listCourses(
        testConfig,
        makeTestHttpClient(() => {
          rc++;
          return page(
            [
              { ...courseFixture, id: `r-${rc}a` },
              { ...courseFixture2, id: `r-${rc}b` },
              { ...courseFixture3, id: `r-${rc}c` },
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
    const err = await collectFail(
      listCourses(
        testConfig,
        makeTestHttpClient(() => fail(500)),
        { type: "all" },
      ),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listCourses(
        testConfig,
        makeTestHttpClient(() => page([{ id: "bad" }])),
        { type: "all" },
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listCourseClasses (nested)
// ============================================================================

describe("listCourseClasses", () => {
  it("streams classes for a course", async () => {
    let req: any;
    const items = await collect(
      listCourseClasses(
        testConfig,
        makeTestHttpClient((r) => {
          req = r;
          return page([classFixture, classFixture2]);
        }),
        CRS,
        { type: "all" },
      ),
    );
    expect(req.url).toContain(`/courses/${CRS}/classes`);
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("cls-001");
  });
});
