import { describe, expect, it } from "vitest";
import { fetchEnrollment, listEnrollments } from "@/api/v2/enrollments.js";
import { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import { enrollmentFixture, enrollmentFixture2, enrollmentFixture3 } from "@tests/helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "@tests/helpers/mock-http-client.js";
import { makeCtx } from "@tests/helpers/test-config.js";
import { BASE, collect, collectFail, fail, page, run, runFail, single } from "@tests/helpers/test-utils.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ENR = "enr-001";

// ============================================================================
// fetchEnrollment
// ============================================================================

describe("fetchEnrollment", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(enrollmentFixture);
    });
    const result = await run(fetchEnrollment(ENR, makeCtx(client)));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/enrollments/${ENR}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("enr-001");
    expect(result.role).toBe("student");
    expect(result.state).toBe("active");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchEnrollment(ENR, makeCtx(makeTestHttpClient(() => fail(404)))));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(fetchEnrollment(ENR, makeCtx(makeTestHttpClient(() => single({ id: "x" })))));
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listEnrollments
// ============================================================================

describe("listEnrollments", () => {
  it("streams items across pages", async () => {
    const empty = await collect(listEnrollments({ type: "all" }, makeCtx(makeTestHttpClient(() => page([])))));
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([enrollmentFixture], `${BASE}/next?cursor=p2`) : page([enrollmentFixture2]);
    };
    const items = await collect(listEnrollments({ type: "all" }, makeCtx(makeTestHttpClient(multi))));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listEnrollments(
        { type: "pages", maxPages: 2 },
        makeCtx(
          makeTestHttpClient(() => {
            pc++;
            return page([{ ...enrollmentFixture, id: `e-${pc}` }], `${BASE}/next?p=${pc + 1}`);
          }),
        ),
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listEnrollments(
        { type: "records", maxRecords: 5 },
        makeCtx(
          makeTestHttpClient(() => {
            rc++;
            return page(
              [
                { ...enrollmentFixture, id: `r-${rc}a` },
                { ...enrollmentFixture2, id: `r-${rc}b` },
                { ...enrollmentFixture3, id: `r-${rc}c` },
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
    const err = await collectFail(listEnrollments({ type: "all" }, makeCtx(makeTestHttpClient(() => fail(500)))));
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listEnrollments({ type: "all" }, makeCtx(makeTestHttpClient(() => page([{ bad: true }])))),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
