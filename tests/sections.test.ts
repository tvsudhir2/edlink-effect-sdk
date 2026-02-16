import { describe, it, expect } from "vitest";
import { Effect, Stream, Chunk } from "effect";
import {
  listSections,
  fetchSection,
  listSectionEnrollments,
  listSectionPeople,
  listSectionTeachers,
  listSectionStudents,
} from "../src/api/v2/sections.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { makeTestHttpClient, type MockHandler } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";
import {
  sectionFixture, sectionFixture2, sectionFixture3,
  enrollmentFixture, enrollmentFixture2,
  personFixture, personFixture2,
} from "./helpers/fixtures.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEC = "sec-100";
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
// fetchSection
// ============================================================================

describe("fetchSection", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => { req = r; return single(sectionFixture); });
    const result = await run(fetchSection(testConfig, client, SEC));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/sections/${SEC}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("sec-001");
    expect(result.state).toBe("active");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchSection(testConfig, makeTestHttpClient(() => fail(404)), SEC));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchSection(testConfig, makeTestHttpClient(() => single({ id: "x" })), SEC),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listSections
// ============================================================================

describe("listSections", () => {
  it("streams items across pages", async () => {
    const empty = await collect(
      listSections(testConfig, makeTestHttpClient(() => page([])), { type: "all" }),
    );
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([sectionFixture], `${BASE}/next?cursor=p2`) : page([sectionFixture2]);
    };
    const items = await collect(listSections(testConfig, makeTestHttpClient(multi), { type: "all" }));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listSections(testConfig, makeTestHttpClient(() => {
        pc++;
        return page([{ ...sectionFixture, id: `s-${pc}` }], `${BASE}/next?p=${pc + 1}`);
      }), { type: "pages", maxPages: 2 }),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listSections(testConfig, makeTestHttpClient(() => {
        rc++;
        return page(
          [{ ...sectionFixture, id: `r-${rc}a` }, { ...sectionFixture2, id: `r-${rc}b` }, { ...sectionFixture3, id: `r-${rc}c` }],
          `${BASE}/next?p=${rc + 1}`,
        );
      }), { type: "records", maxRecords: 5 }),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err = await collectFail(listSections(testConfig, makeTestHttpClient(() => fail(500)), { type: "all" }));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listSections(testConfig, makeTestHttpClient(() => page([{ id: "bad" }])), { type: "all" }),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// Nested list endpoints
// ============================================================================

describe("listSectionEnrollments", () => {
  it("streams enrollments for a section", async () => {
    let req: any;
    const items = await collect(
      listSectionEnrollments(testConfig, makeTestHttpClient((r) => { req = r; return page([enrollmentFixture, enrollmentFixture2]); }), SEC, { type: "all" }),
    );
    expect(req.url).toContain(`/sections/${SEC}/enrollments`);
    expect(items).toHaveLength(2);
  });
});

describe("listSectionPeople", () => {
  it("streams people for a section", async () => {
    let req: any;
    const items = await collect(
      listSectionPeople(testConfig, makeTestHttpClient((r) => { req = r; return page([personFixture, personFixture2]); }), SEC, { type: "all" }),
    );
    expect(req.url).toContain(`/sections/${SEC}/people`);
    expect(items).toHaveLength(2);
  });
});

describe("listSectionTeachers", () => {
  it("streams teachers for a section", async () => {
    let req: any;
    const items = await collect(
      listSectionTeachers(testConfig, makeTestHttpClient((r) => { req = r; return page([personFixture]); }), SEC, { type: "all" }),
    );
    expect(req.url).toContain(`/sections/${SEC}/teachers`);
    expect(items).toHaveLength(1);
  });
});

describe("listSectionStudents", () => {
  it("streams students for a section", async () => {
    let req: any;
    const items = await collect(
      listSectionStudents(testConfig, makeTestHttpClient((r) => { req = r; return page([personFixture]); }), SEC, { type: "all" }),
    );
    expect(req.url).toContain(`/sections/${SEC}/students`);
    expect(items).toHaveLength(1);
  });
});
