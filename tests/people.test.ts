import { describe, it, expect } from "vitest";
import { Effect, Stream, Chunk } from "effect";
import {
  listPeople,
  fetchPerson,
  listPersonEnrollments,
  listPersonDistricts,
  listPersonSchools,
  listPersonClasses,
  listPersonSections,
  listPersonAgents,
} from "../src/api/v2/people.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { makeTestHttpClient, type MockHandler } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";
import {
  personFixture, personFixture2, personFixture3,
  enrollmentFixture, enrollmentFixture2,
  districtFixture, districtFixture2,
  schoolFixture, schoolFixture2,
  classFixture, classFixture2,
  sectionFixture, sectionFixture2,
  agentFixture, agentFixture2,
} from "./helpers/fixtures.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PER = "per-100";
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
// fetchPerson
// ============================================================================

describe("fetchPerson", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => { req = r; return single(personFixture); });
    const result = await run(fetchPerson(testConfig, client, PER));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/people/${PER}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("per-001");
    expect(result.display_name).toBe("Jane Doe");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchPerson(testConfig, makeTestHttpClient(() => fail(404)), PER));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchPerson(testConfig, makeTestHttpClient(() => single({ id: "x" })), PER),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listPeople
// ============================================================================

describe("listPeople", () => {
  it("streams items across pages", async () => {
    const empty = await collect(
      listPeople(testConfig, makeTestHttpClient(() => page([])), { type: "all" }),
    );
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([personFixture], `${BASE}/next?cursor=p2`) : page([personFixture2]);
    };
    const items = await collect(listPeople(testConfig, makeTestHttpClient(multi), { type: "all" }));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listPeople(testConfig, makeTestHttpClient(() => {
        pc++;
        return page([{ ...personFixture, id: `p-${pc}` }], `${BASE}/next?p=${pc + 1}`);
      }), { type: "pages", maxPages: 2 }),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listPeople(testConfig, makeTestHttpClient(() => {
        rc++;
        return page(
          [{ ...personFixture, id: `r-${rc}a` }, { ...personFixture2, id: `r-${rc}b` }, { ...personFixture3, id: `r-${rc}c` }],
          `${BASE}/next?p=${rc + 1}`,
        );
      }), { type: "records", maxRecords: 5 }),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err = await collectFail(listPeople(testConfig, makeTestHttpClient(() => fail(500)), { type: "all" }));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listPeople(testConfig, makeTestHttpClient(() => page([{ id: "bad" }])), { type: "all" }),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// Nested list endpoints
// ============================================================================

describe("listPersonEnrollments", () => {
  it("streams enrollments for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonEnrollments(testConfig, makeTestHttpClient((r) => { req = r; return page([enrollmentFixture, enrollmentFixture2]); }), PER, { type: "all" }),
    );
    expect(req.url).toContain(`/people/${PER}/enrollments`);
    expect(items).toHaveLength(2);
  });
});

describe("listPersonDistricts", () => {
  it("streams districts for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonDistricts(testConfig, makeTestHttpClient((r) => { req = r; return page([districtFixture, districtFixture2]); }), PER, { type: "all" }),
    );
    expect(req.url).toContain(`/people/${PER}/districts`);
    expect(items).toHaveLength(2);
  });
});

describe("listPersonSchools", () => {
  it("streams schools for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonSchools(testConfig, makeTestHttpClient((r) => { req = r; return page([schoolFixture, schoolFixture2]); }), PER, { type: "all" }),
    );
    expect(req.url).toContain(`/people/${PER}/schools`);
    expect(items).toHaveLength(2);
  });
});

describe("listPersonClasses", () => {
  it("streams classes for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonClasses(testConfig, makeTestHttpClient((r) => { req = r; return page([classFixture, classFixture2]); }), PER, { type: "all" }),
    );
    expect(req.url).toContain(`/people/${PER}/classes`);
    expect(items).toHaveLength(2);
  });
});

describe("listPersonSections", () => {
  it("streams sections for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonSections(testConfig, makeTestHttpClient((r) => { req = r; return page([sectionFixture, sectionFixture2]); }), PER, { type: "all" }),
    );
    expect(req.url).toContain(`/people/${PER}/sections`);
    expect(items).toHaveLength(2);
  });
});

describe("listPersonAgents", () => {
  it("streams agents for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonAgents(testConfig, makeTestHttpClient((r) => { req = r; return page([agentFixture, agentFixture2]); }), PER, { type: "all" }),
    );
    expect(req.url).toContain(`/people/${PER}/agents`);
    expect(items).toHaveLength(2);
  });
});
