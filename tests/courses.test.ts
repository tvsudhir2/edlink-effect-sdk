import { describe, expect, it } from "vitest";

import { classFixture, classFixture2, courseFixture, courseFixture2, courseFixture3 } from "@tests/helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "@tests/helpers/mock-http-client.js";
import { makeCtx } from "@tests/helpers/test-config.js";
import { BASE, collect, collectFail, fail, page, run, runFail, single } from "@tests/helpers/test-utils.js";
import { fetchCourse, listCourseClasses, listCourses } from "@/api/v2/courses.js";
import { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CRS = "crs-100";

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
    const result = await run(fetchCourse(CRS, makeCtx(client)));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/courses/${CRS}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("crs-001");
    expect(result.name).toBe("Mathematics");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchCourse(CRS, makeCtx(makeTestHttpClient(() => fail(404)))));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(fetchCourse(CRS, makeCtx(makeTestHttpClient(() => single({ id: "x" })))));
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listCourses
// ============================================================================

describe("listCourses", () => {
  it("streams items across pages", async () => {
    const empty = await collect(listCourses({ type: "all" }, makeCtx(makeTestHttpClient(() => page([])))));
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([courseFixture], `${BASE}/next?cursor=p2`) : page([courseFixture2]);
    };
    const items = await collect(listCourses({ type: "all" }, makeCtx(makeTestHttpClient(multi))));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listCourses(
        { type: "pages", maxPages: 2 },
        makeCtx(
          makeTestHttpClient(() => {
            pc++;
            return page([{ ...courseFixture, id: `c-${pc}` }], `${BASE}/next?p=${pc + 1}`);
          }),
        ),
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listCourses(
        { type: "records", maxRecords: 5 },
        makeCtx(
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
        ),
      ),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err = await collectFail(listCourses({ type: "all" }, makeCtx(makeTestHttpClient(() => fail(500)))));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listCourses({ type: "all" }, makeCtx(makeTestHttpClient(() => page([{ id: "bad" }])))),
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
        { courseId: CRS, pagination: { type: "all" } },
        makeCtx(
          makeTestHttpClient((r) => {
            req = r;
            return page([classFixture, classFixture2]);
          }),
        ),
      ),
    );
    expect(req.url).toContain(`/courses/${CRS}/classes`);
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("cls-001");
  });
});
