import { Chunk, Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";
import {
  fetchClass,
  listClassEnrollments,
  listClasses,
  listClassPeople,
  listClassSections,
  listClassStudents,
  listClassTeachers,
} from "../src/api/v2/classes.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import {
  classFixture,
  classFixture2,
  classFixture3,
  enrollmentFixture,
  enrollmentFixture2,
  personFixture,
  personFixture2,
  sectionFixture,
  sectionFixture2,
} from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";
import { makeCtx, testConfig } from "./helpers/test-config.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CLS = "cls-100";
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
// fetchClass
// ============================================================================

describe("fetchClass", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(classFixture);
    });
    const result = await run(fetchClass(CLS, makeCtx(client)));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("cls-001");
    expect(result.state).toBe("active");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchClass(CLS, makeCtx(makeTestHttpClient(() => fail(404)))));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(fetchClass(CLS, makeCtx(makeTestHttpClient(() => single({ id: "x" })))));
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listClasses
// ============================================================================

describe("listClasses", () => {
  it("streams items across pages", async () => {
    const empty = await collect(listClasses({ type: "all" }, makeCtx(makeTestHttpClient(() => page([])))));
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([classFixture], `${BASE}/next?cursor=p2`) : page([classFixture2]);
    };
    const items = await collect(listClasses({ type: "all" }, makeCtx(makeTestHttpClient(multi))));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listClasses(
        { type: "pages", maxPages: 2 },
        makeCtx(
          makeTestHttpClient(() => {
            pc++;
            return page([{ ...classFixture, id: `c-${pc}` }], `${BASE}/next?p=${pc + 1}`);
          }),
        ),
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listClasses(
        { type: "records", maxRecords: 5 },
        makeCtx(
          makeTestHttpClient(() => {
            rc++;
            return page(
              [
                { ...classFixture, id: `r-${rc}a` },
                { ...classFixture2, id: `r-${rc}b` },
                { ...classFixture3, id: `r-${rc}c` },
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
    const err = await collectFail(listClasses({ type: "all" }, makeCtx(makeTestHttpClient(() => fail(500)))));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listClasses({ type: "all" }, makeCtx(makeTestHttpClient(() => page([{ id: "bad" }])))),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// Nested list endpoints
// ============================================================================

describe("listClassSections", () => {
  it("streams sections for a class", async () => {
    let req: any;
    const items = await collect(
      listClassSections(
        { classId: CLS, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([sectionFixture, sectionFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/classes/${CLS}/sections`);
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("sec-001");
  });
});

describe("listClassEnrollments", () => {
  it("streams enrollments for a class", async () => {
    let req: any;
    const items = await collect(
      listClassEnrollments(
        { classId: CLS, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([enrollmentFixture, enrollmentFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/classes/${CLS}/enrollments`);
    expect(items).toHaveLength(2);
    expect(items[0]!.role).toBe("student");
  });
});

describe("listClassPeople", () => {
  it("streams people for a class", async () => {
    let req: any;
    const items = await collect(
      listClassPeople(
        { classId: CLS, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([personFixture, personFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/classes/${CLS}/people`);
    expect(items).toHaveLength(2);
  });
});

describe("listClassTeachers", () => {
  it("streams teachers for a class", async () => {
    let req: any;
    const items = await collect(
      listClassTeachers(
        { classId: CLS, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([personFixture]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/classes/${CLS}/teachers`);
    expect(items).toHaveLength(1);
  });
});

describe("listClassStudents", () => {
  it("streams students for a class", async () => {
    let req: any;
    const items = await collect(
      listClassStudents(
        { classId: CLS, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([personFixture]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/classes/${CLS}/students`);
    expect(items).toHaveLength(1);
  });
});
