import { describe, it, expect } from "vitest";
import { Effect, Stream, Chunk } from "effect";
import {
  listAssignments,
  fetchAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../src/api/v2/assignments.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { makeTestHttpClient, type MockHandler } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";

// ---------------------------------------------------------------------------
// Fixtures — domain-specific, colocated with tests
// ---------------------------------------------------------------------------

const assignmentFixture = {
  id: "asgn-001",
  title: "Week 3 Reading Response",
  description: "<p>Read chapter 3 and respond.</p>",
  description_plaintext: "Read chapter 3 and respond.",
  state: "open" as const,
  assignee_mode: "all" as const,
  assignee_ids: [],
  category_id: null,
  session_id: "session-001",
  grading_type: "points",
  max_attempts: 1,
  points_possible: 100,
  submission_types: ["online_text_entry"],
  attachments: [{ type: "link" as const, url: "https://example.com/chapter3.pdf", title: "Chapter 3" }],
  properties: {},
  display_date: null,
  due_date: "2026-03-01T23:59:59.000Z",
  start_date: "2026-02-15T00:00:00.000Z",
  end_date: null,
  created_date: "2026-02-10T12:00:00.000Z",
  updated_date: "2026-02-10T12:00:00.000Z",
};

const assignmentFixture2 = { ...assignmentFixture, id: "asgn-002", title: "Week 4 Essay" };
const assignmentFixture3 = { ...assignmentFixture, id: "asgn-003", title: "Week 5 Lab Report" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CLS = "cls-100";
const ASGN = "asgn-001";
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
// fetchAssignment
// ============================================================================

describe("fetchAssignment", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => { req = r; return single(assignmentFixture); });
    const result = await run(fetchAssignment(testConfig, client, CLS, ASGN));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/assignments/${ASGN}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe(assignmentFixture.id);
    expect(result.state).toBe("open");
    expect(result.points_possible).toBe(100);
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(fetchAssignment(testConfig, makeTestHttpClient(() => fail(404)), CLS, ASGN));
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchAssignment(testConfig, makeTestHttpClient(() => single({ id: "x" })), CLS, ASGN),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// createAssignment
// ============================================================================

describe("createAssignment", () => {
  const body = { title: "New", description: "desc", points_possible: 50 };

  it("POSTs to the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => { req = r; return single(assignmentFixture); });
    const result = await run(createAssignment(testConfig, client, CLS, body));

    expect(req.method).toBe("POST");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/assignments`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe(assignmentFixture.id);
  });

  it("returns EdlinkApiError on 400, EdlinkDecodeError on bad schema", async () => {
    const err400 = await runFail(createAssignment(testConfig, makeTestHttpClient(() => fail(400)), CLS, body));
    expect(err400).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      createAssignment(testConfig, makeTestHttpClient(() => single({ id: "x" })), CLS, body),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// updateAssignment
// ============================================================================

describe("updateAssignment", () => {
  const patch = { title: "Updated", points_possible: 75 };
  const updated = { ...assignmentFixture, ...patch };

  it("PATCHes the correct URL with auth and returns updated fields", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => { req = r; return single(updated); });
    const result = await run(updateAssignment(testConfig, client, CLS, ASGN, patch));

    expect(req.method).toBe("PATCH");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/assignments/${ASGN}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.title).toBe("Updated");
    expect(result.points_possible).toBe(75);
  });

  it("returns EdlinkApiError on 404", async () => {
    const err = await runFail(updateAssignment(testConfig, makeTestHttpClient(() => fail(404)), CLS, ASGN, patch));
    expect(err).toBeInstanceOf(EdlinkApiError);
  });
});

// ============================================================================
// deleteAssignment
// ============================================================================

describe("deleteAssignment", () => {
  it("DELETEs the correct URL with auth and resolves void", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => { req = r; return { status: 200 }; });
    const result = await run(deleteAssignment(testConfig, client, CLS, ASGN));

    expect(req.method).toBe("DELETE");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/assignments/${ASGN}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result).toBeUndefined();
  });

  it("returns EdlinkApiError on 404", async () => {
    const err = await runFail(deleteAssignment(testConfig, makeTestHttpClient(() => fail(404)), CLS, ASGN));
    expect(err).toBeInstanceOf(EdlinkApiError);
  });
});

// ============================================================================
// listAssignments (paginated stream)
// ============================================================================

describe("listAssignments", () => {
  it("streams items across pages; returns empty for no data", async () => {
    // empty
    const empty = await collect(
      listAssignments(testConfig, makeTestHttpClient(() => page([])), CLS, { type: "all" }),
    );
    expect(empty).toHaveLength(0);

    // single page
    const items = await collect(
      listAssignments(
        testConfig,
        makeTestHttpClient(() => page([assignmentFixture, assignmentFixture2])),
        CLS, { type: "all" },
      ),
    );
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("asgn-001");
    expect(items[1]!.id).toBe("asgn-002");

    // multi page
    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1
        ? page([assignmentFixture], `${BASE}/next?cursor=p2`)
        : page([assignmentFixture2]);
    };
    const multiItems = await collect(listAssignments(testConfig, makeTestHttpClient(multi), CLS, { type: "all" }));
    expect(multiItems).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords pagination limits", async () => {
    // maxPages: 2
    let pc = 0;
    const byPages = await collect(
      listAssignments(testConfig, makeTestHttpClient(() => {
        pc++;
        return page([{ ...assignmentFixture, id: `a-${pc}` }], `${BASE}/next?p=${pc + 1}`);
      }), CLS, { type: "pages", maxPages: 2 }),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    // maxRecords: 5 (3 per page → 3 + trimmed 2 = 5)
    let rc = 0;
    const byRecs = await collect(
      listAssignments(testConfig, makeTestHttpClient(() => {
        rc++;
        return page(
          [{ ...assignmentFixture, id: `r-${rc}a` }, { ...assignmentFixture2, id: `r-${rc}b` }, { ...assignmentFixture3, id: `r-${rc}c` }],
          `${BASE}/next?p=${rc + 1}`,
        );
      }), CLS, { type: "records", maxRecords: 5 }),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err500 = await collectFail(
      listAssignments(testConfig, makeTestHttpClient(() => fail(500)), CLS, { type: "all" }),
    );
    expect(err500).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listAssignments(testConfig, makeTestHttpClient(() => page([{ id: "bad" }])), CLS, { type: "all" }),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
