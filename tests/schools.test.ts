import { describe, it, expect } from "vitest";
import { Effect, Stream, Chunk } from "effect";
import {
  listSchools,
  fetchSchool,
  listSchoolClasses,
  listSchoolCourses,
  listSchoolSessions,
  listSchoolPeople,
  listSchoolAdministrators,
  listSchoolTeachers,
  listSchoolStudents,
} from "../src/api/v2/schools.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { makeTestHttpClient, type MockHandler } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";
import {
  schoolFixture, schoolFixture2, schoolFixture3,
  classFixture, classFixture2,
  courseFixture, courseFixture2,
  sessionFixture, sessionFixture2,
  personFixture, personFixture2,
} from "./helpers/fixtures.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SCH = "sch-100";
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
// fetchSchool
// ============================================================================

describe("fetchSchool", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => { req = r; return single(schoolFixture); });
    const result = await run(fetchSchool(testConfig, client, SCH));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/schools/${SCH}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("sch-001");
    expect(result.name).toBe("Springfield Elementary");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchSchool(testConfig, makeTestHttpClient(() => fail(404)), SCH));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchSchool(testConfig, makeTestHttpClient(() => single({ id: "x" })), SCH),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listSchools
// ============================================================================

describe("listSchools", () => {
  it("streams items across pages", async () => {
    const empty = await collect(
      listSchools(testConfig, makeTestHttpClient(() => page([])), { type: "all" }),
    );
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([schoolFixture], `${BASE}/next?cursor=p2`) : page([schoolFixture2]);
    };
    const items = await collect(listSchools(testConfig, makeTestHttpClient(multi), { type: "all" }));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listSchools(testConfig, makeTestHttpClient(() => {
        pc++;
        return page([{ ...schoolFixture, id: `s-${pc}` }], `${BASE}/next?p=${pc + 1}`);
      }), { type: "pages", maxPages: 2 }),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listSchools(testConfig, makeTestHttpClient(() => {
        rc++;
        return page(
          [{ ...schoolFixture, id: `r-${rc}a` }, { ...schoolFixture2, id: `r-${rc}b` }, { ...schoolFixture3, id: `r-${rc}c` }],
          `${BASE}/next?p=${rc + 1}`,
        );
      }), { type: "records", maxRecords: 5 }),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err = await collectFail(listSchools(testConfig, makeTestHttpClient(() => fail(500)), { type: "all" }));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listSchools(testConfig, makeTestHttpClient(() => page([{ id: "bad" }])), { type: "all" }),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// Nested list endpoints
// ============================================================================

describe("listSchoolClasses", () => {
  it("streams classes for a school", async () => {
    let req: any;
    const items = await collect(
      listSchoolClasses(testConfig, makeTestHttpClient((r) => { req = r; return page([classFixture, classFixture2]); }), SCH, { type: "all" }),
    );
    expect(req.url).toContain(`/schools/${SCH}/classes`);
    expect(items).toHaveLength(2);
  });
});

describe("listSchoolCourses", () => {
  it("streams courses for a school", async () => {
    let req: any;
    const items = await collect(
      listSchoolCourses(testConfig, makeTestHttpClient((r) => { req = r; return page([courseFixture, courseFixture2]); }), SCH, { type: "all" }),
    );
    expect(req.url).toContain(`/schools/${SCH}/courses`);
    expect(items).toHaveLength(2);
  });
});

describe("listSchoolSessions", () => {
  it("streams sessions for a school", async () => {
    let req: any;
    const items = await collect(
      listSchoolSessions(testConfig, makeTestHttpClient((r) => { req = r; return page([sessionFixture, sessionFixture2]); }), SCH, { type: "all" }),
    );
    expect(req.url).toContain(`/schools/${SCH}/sessions`);
    expect(items).toHaveLength(2);
  });
});

describe("listSchoolPeople", () => {
  it("streams people for a school", async () => {
    let req: any;
    const items = await collect(
      listSchoolPeople(testConfig, makeTestHttpClient((r) => { req = r; return page([personFixture, personFixture2]); }), SCH, { type: "all" }),
    );
    expect(req.url).toContain(`/schools/${SCH}/people`);
    expect(items).toHaveLength(2);
  });
});

describe("listSchoolAdministrators", () => {
  it("streams administrators for a school", async () => {
    let req: any;
    const items = await collect(
      listSchoolAdministrators(testConfig, makeTestHttpClient((r) => { req = r; return page([personFixture]); }), SCH, { type: "all" }),
    );
    expect(req.url).toContain(`/schools/${SCH}/administrators`);
    expect(items).toHaveLength(1);
  });
});

describe("listSchoolTeachers", () => {
  it("streams teachers for a school", async () => {
    let req: any;
    const items = await collect(
      listSchoolTeachers(testConfig, makeTestHttpClient((r) => { req = r; return page([personFixture]); }), SCH, { type: "all" }),
    );
    expect(req.url).toContain(`/schools/${SCH}/teachers`);
    expect(items).toHaveLength(1);
  });
});

describe("listSchoolStudents", () => {
  it("streams students for a school", async () => {
    let req: any;
    const items = await collect(
      listSchoolStudents(testConfig, makeTestHttpClient((r) => { req = r; return page([personFixture]); }), SCH, { type: "all" }),
    );
    expect(req.url).toContain(`/schools/${SCH}/students`);
    expect(items).toHaveLength(1);
  });
});
