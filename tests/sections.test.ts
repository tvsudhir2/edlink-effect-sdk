import { describe, expect, it } from "vitest";

import {
  enrollmentFixture,
  enrollmentFixture2,
  personFixture,
  personFixture2,
  sectionFixture,
  sectionFixture2,
  sectionFixture3,
} from "@tests/helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "@tests/helpers/mock-http-client.js";
import { makeCtx } from "@tests/helpers/test-config.js";
import { BASE, collect, collectFail, fail, page, run, runFail, single } from "@tests/helpers/test-utils.js";
import {
  fetchSection,
  listSectionEnrollments,
  listSectionPeople,
  listSectionStudents,
  listSections,
  listSectionTeachers,
} from "@/api/v2/sections.js";
import { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEC = "sec-100";

// ============================================================================
// fetchSection
// ============================================================================

describe("fetchSection", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(sectionFixture);
    });
    const result = await run(fetchSection(SEC, makeCtx(client)));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/sections/${SEC}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("sec-001");
    expect(result.state).toBe("active");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchSection(SEC, makeCtx(makeTestHttpClient(() => fail(404)))));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(fetchSection(SEC, makeCtx(makeTestHttpClient(() => single({ id: "x" })))));
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listSections
// ============================================================================

describe("listSections", () => {
  it("streams items across pages", async () => {
    const empty = await collect(listSections({ type: "all" }, makeCtx(makeTestHttpClient(() => page([])))));
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([sectionFixture], `${BASE}/next?cursor=p2`) : page([sectionFixture2]);
    };
    const items = await collect(listSections({ type: "all" }, makeCtx(makeTestHttpClient(multi))));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listSections(
        { type: "pages", maxPages: 2 },
        makeCtx(
          makeTestHttpClient(() => {
            pc++;
            return page([{ ...sectionFixture, id: `s-${pc}` }], `${BASE}/next?p=${pc + 1}`);
          }),
        ),
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listSections(
        { type: "records", maxRecords: 5 },
        makeCtx(
          makeTestHttpClient(() => {
            rc++;
            return page(
              [
                { ...sectionFixture, id: `r-${rc}a` },
                { ...sectionFixture2, id: `r-${rc}b` },
                { ...sectionFixture3, id: `r-${rc}c` },
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
    const err = await collectFail(listSections({ type: "all" }, makeCtx(makeTestHttpClient(() => fail(500)))));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listSections({ type: "all" }, makeCtx(makeTestHttpClient(() => page([{ id: "bad" }])))),
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
      listSectionEnrollments(
        { sectionId: SEC, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([enrollmentFixture, enrollmentFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/sections/${SEC}/enrollments`);
    expect(items).toHaveLength(2);
  });
});

describe("listSectionPeople", () => {
  it("streams people for a section", async () => {
    let req: any;
    const items = await collect(
      listSectionPeople(
        { sectionId: SEC, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([personFixture, personFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/sections/${SEC}/people`);
    expect(items).toHaveLength(2);
  });
});

describe("listSectionTeachers", () => {
  it("streams teachers for a section", async () => {
    let req: any;
    const items = await collect(
      listSectionTeachers(
        { sectionId: SEC, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([personFixture]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/sections/${SEC}/teachers`);
    expect(items).toHaveLength(1);
  });
});

describe("listSectionStudents", () => {
  it("streams students for a section", async () => {
    let req: any;
    const items = await collect(
      listSectionStudents(
        { sectionId: SEC, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([personFixture]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/sections/${SEC}/students`);
    expect(items).toHaveLength(1);
  });
});
