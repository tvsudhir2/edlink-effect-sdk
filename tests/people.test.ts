import { describe, expect, it } from "vitest";
import {
  fetchPerson,
  listPeople,
  listPersonAgents,
  listPersonClasses,
  listPersonDistricts,
  listPersonEnrollments,
  listPersonSchools,
  listPersonSections,
} from "@/api/v2/people.js";
import { EdlinkApiError, EdlinkDecodeError } from '@/errors.js';
import {
  agentFixture,
  agentFixture2,
  classFixture,
  classFixture2,
  districtFixture,
  districtFixture2,
  enrollmentFixture,
  enrollmentFixture2,
  personFixture,
  personFixture2,
  personFixture3,
  schoolFixture,
  schoolFixture2,
  sectionFixture,
  sectionFixture2,
} from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";
import { makeCtx } from "./helpers/test-config.js";
import { BASE, collect, collectFail, fail, page, run, runFail, single } from "./helpers/test-utils.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PER = "per-100";

// ============================================================================
// fetchPerson
// ============================================================================

describe("fetchPerson", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(personFixture);
    });
    const result = await run(fetchPerson(PER, makeCtx(client)));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/people/${PER}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("per-001");
    expect(result.display_name).toBe("Jane Doe");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchPerson(PER, makeCtx(makeTestHttpClient(() => fail(404)))));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(fetchPerson(PER, makeCtx(makeTestHttpClient(() => single({ id: "x" })))));
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listPeople
// ============================================================================

describe("listPeople", () => {
  it("streams items across pages", async () => {
    const empty = await collect(listPeople({ type: "all" }, makeCtx(makeTestHttpClient(() => page([])))));
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([personFixture], `${BASE}/next?cursor=p2`) : page([personFixture2]);
    };
    const items = await collect(listPeople({ type: "all" }, makeCtx(makeTestHttpClient(multi))));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listPeople(
        { type: "pages", maxPages: 2 },
        makeCtx(
          makeTestHttpClient(() => {
            pc++;
            return page([{ ...personFixture, id: `p-${pc}` }], `${BASE}/next?p=${pc + 1}`);
          }),
        ),
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listPeople(
        { type: "records", maxRecords: 5 },
        makeCtx(
          makeTestHttpClient(() => {
            rc++;
            return page(
              [
                { ...personFixture, id: `r-${rc}a` },
                { ...personFixture2, id: `r-${rc}b` },
                { ...personFixture3, id: `r-${rc}c` },
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
    const err = await collectFail(listPeople({ type: "all" }, makeCtx(makeTestHttpClient(() => fail(500)))));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listPeople({ type: "all" }, makeCtx(makeTestHttpClient(() => page([{ id: "bad" }])))),
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
      listPersonEnrollments(
        { personId: PER, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([enrollmentFixture, enrollmentFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/people/${PER}/enrollments`);
    expect(items).toHaveLength(2);
  });
});

describe("listPersonDistricts", () => {
  it("streams districts for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonDistricts(
        { personId: PER, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([districtFixture, districtFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/people/${PER}/districts`);
    expect(items).toHaveLength(2);
  });
});

describe("listPersonSchools", () => {
  it("streams schools for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonSchools(
        { personId: PER, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([schoolFixture, schoolFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/people/${PER}/schools`);
    expect(items).toHaveLength(2);
  });
});

describe("listPersonClasses", () => {
  it("streams classes for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonClasses(
        { personId: PER, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([classFixture, classFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/people/${PER}/classes`);
    expect(items).toHaveLength(2);
  });
});

describe("listPersonSections", () => {
  it("streams sections for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonSections(
        { personId: PER, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([sectionFixture, sectionFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/people/${PER}/sections`);
    expect(items).toHaveLength(2);
  });
});

describe("listPersonAgents", () => {
  it("streams agents for a person", async () => {
    let req: any;
    const items = await collect(
      listPersonAgents(
        { personId: PER, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([agentFixture, agentFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/people/${PER}/agents`);
    expect(items).toHaveLength(2);
  });
});
