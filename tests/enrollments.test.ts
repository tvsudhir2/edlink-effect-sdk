import { Chunk, Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";
import { fetchEnrollment, listEnrollments } from "../src/api/v2/enrollments.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { enrollmentFixture, enrollmentFixture2, enrollmentFixture3 } from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ENR = "enr-001";
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
// fetchEnrollment
// ============================================================================

describe("fetchEnrollment", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(enrollmentFixture);
    });
    const result = await run(fetchEnrollment(testConfig, client, ENR));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/enrollments/${ENR}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe("enr-001");
    expect(result.role).toBe("student");
    expect(result.state).toBe("active");
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(
      fetchEnrollment(
        testConfig,
        makeTestHttpClient(() => fail(404)),
        ENR,
      ),
    );
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchEnrollment(
        testConfig,
        makeTestHttpClient(() => single({ id: "x" })),
        ENR,
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// listEnrollments
// ============================================================================

describe("listEnrollments", () => {
  it("streams items across pages", async () => {
    const empty = await collect(
      listEnrollments(
        testConfig,
        makeTestHttpClient(() => page([])),
        { type: "all" },
      ),
    );
    expect(empty).toHaveLength(0);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([enrollmentFixture], `${BASE}/next?cursor=p2`) : page([enrollmentFixture2]);
    };
    const items = await collect(listEnrollments(testConfig, makeTestHttpClient(multi), { type: "all" }));
    expect(items).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords", async () => {
    let pc = 0;
    const byPages = await collect(
      listEnrollments(
        testConfig,
        makeTestHttpClient(() => {
          pc++;
          return page([{ ...enrollmentFixture, id: `e-${pc}` }], `${BASE}/next?p=${pc + 1}`);
        }),
        { type: "pages", maxPages: 2 },
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listEnrollments(
        testConfig,
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
        { type: "records", maxRecords: 5 },
      ),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err = await collectFail(
      listEnrollments(
        testConfig,
        makeTestHttpClient(() => fail(500)),
        { type: "all" },
      ),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listEnrollments(
        testConfig,
        makeTestHttpClient(() => page([{ bad: true }])),
        { type: "all" },
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
