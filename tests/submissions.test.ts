import { Chunk, Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";
import {
  fetchSubmission,
  listSubmissions,
  reclaimSubmission,
  returnSubmission,
  submitAttempt,
  updateSubmission,
} from "../src/api/v2/submissions.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { submissionFixture, submissionFixture2, submissionFixture3 } from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CLS = "cls-100";
const ASGN = "asgn-100";
const SUB = "sub-001";
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
// fetchSubmission
// ============================================================================

describe("fetchSubmission", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(submissionFixture);
    });
    const result = await run(fetchSubmission(testConfig, client, CLS, ASGN, SUB));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/assignments/${ASGN}/submissions/${SUB}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("sub-001");
    expect(result.state).toBe("created");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(
      fetchSubmission(
        testConfig,
        makeTestHttpClient(() => fail(404)),
        CLS,
        ASGN,
        SUB,
      ),
    );
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchSubmission(
        testConfig,
        makeTestHttpClient(() => single({ id: "x" })),
        CLS,
        ASGN,
        SUB,
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// submitAttempt
// ============================================================================

describe("submitAttempt", () => {
  const body = { text: "My submission text" };

  it("POSTs to the /submit URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(submissionFixture);
    });
    const result = await run(submitAttempt(testConfig, client, CLS, ASGN, body));

    expect(req.method).toBe("POST");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/assignments/${ASGN}/submit`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("sub-001");
  });

  it("returns EdlinkApiError on 400", async () => {
    const err = await runFail(
      submitAttempt(
        testConfig,
        makeTestHttpClient(() => fail(400)),
        CLS,
        ASGN,
        body,
      ),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });
});

// ============================================================================
// reclaimSubmission
// ============================================================================

describe("reclaimSubmission", () => {
  it("POSTs to the /reclaim URL with empty body", async () => {
    let req: any;
    const reclaimed = { ...submissionFixture, state: "reclaimed" as const };
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(reclaimed);
    });
    const result = await run(reclaimSubmission(testConfig, client, CLS, ASGN));

    expect(req.method).toBe("POST");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/assignments/${ASGN}/reclaim`);
    expect(result.state).toBe("reclaimed");
  });

  it("returns EdlinkApiError on 404", async () => {
    const err = await runFail(
      reclaimSubmission(
        testConfig,
        makeTestHttpClient(() => fail(404)),
        CLS,
        ASGN,
      ),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });
});

// ============================================================================
// returnSubmission
// ============================================================================

describe("returnSubmission", () => {
  it("POSTs to the /return URL with empty body", async () => {
    let req: any;
    const returned = { ...submissionFixture, state: "returned" as const };
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(returned);
    });
    const result = await run(returnSubmission(testConfig, client, CLS, ASGN, SUB));

    expect(req.method).toBe("POST");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/assignments/${ASGN}/submissions/${SUB}/return`);
    expect(result.state).toBe("returned");
  });

  it("returns EdlinkApiError on 404", async () => {
    const err = await runFail(
      returnSubmission(
        testConfig,
        makeTestHttpClient(() => fail(404)),
        CLS,
        ASGN,
        SUB,
      ),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });
});

// ============================================================================
// updateSubmission
// ============================================================================

describe("updateSubmission", () => {
  const patch = { grade_points: 85 };
  const updated = { ...submissionFixture, ...patch };

  it("PATCHes the correct URL with auth and returns updated fields", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(updated);
    });
    const result = await run(updateSubmission(testConfig, client, CLS, ASGN, SUB, patch));

    expect(req.method).toBe("PATCH");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/assignments/${ASGN}/submissions/${SUB}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.grade_points).toBe(85);
  });

  it("returns EdlinkApiError on 404", async () => {
    const err = await runFail(
      updateSubmission(
        testConfig,
        makeTestHttpClient(() => fail(404)),
        CLS,
        ASGN,
        SUB,
        patch,
      ),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });
});

// ============================================================================
// listSubmissions (paginated stream)
// ============================================================================

describe("listSubmissions", () => {
  it("streams items across pages; returns empty for no data", async () => {
    const empty = await collect(
      listSubmissions(
        testConfig,
        makeTestHttpClient(() => page([])),
        CLS,
        ASGN,
        { type: "all" },
      ),
    );
    expect(empty).toHaveLength(0);

    const items = await collect(
      listSubmissions(
        testConfig,
        makeTestHttpClient(() => page([submissionFixture, submissionFixture2])),
        CLS,
        ASGN,
        { type: "all" },
      ),
    );
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("sub-001");

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([submissionFixture], `${BASE}/next?cursor=p2`) : page([submissionFixture2]);
    };
    const multiItems = await collect(
      listSubmissions(testConfig, makeTestHttpClient(multi), CLS, ASGN, { type: "all" }),
    );
    expect(multiItems).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords pagination limits", async () => {
    let pc = 0;
    const byPages = await collect(
      listSubmissions(
        testConfig,
        makeTestHttpClient(() => {
          pc++;
          return page([{ ...submissionFixture, id: `s-${pc}` }], `${BASE}/next?p=${pc + 1}`);
        }),
        CLS,
        ASGN,
        { type: "pages", maxPages: 2 },
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listSubmissions(
        testConfig,
        makeTestHttpClient(() => {
          rc++;
          return page(
            [
              { ...submissionFixture, id: `r-${rc}a` },
              { ...submissionFixture2, id: `r-${rc}b` },
              { ...submissionFixture3, id: `r-${rc}c` },
            ],
            `${BASE}/next?p=${rc + 1}`,
          );
        }),
        CLS,
        ASGN,
        { type: "records", maxRecords: 5 },
      ),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err500 = await collectFail(
      listSubmissions(
        testConfig,
        makeTestHttpClient(() => fail(500)),
        CLS,
        ASGN,
        { type: "all" },
      ),
    );
    expect(err500).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listSubmissions(
        testConfig,
        makeTestHttpClient(() => page([{ id: "bad" }])),
        CLS,
        ASGN,
        { type: "all" },
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
