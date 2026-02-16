import { Chunk, Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";
import {
  createCategory,
  deleteCategory,
  fetchCategory,
  listCategories,
  updateCategory,
} from "../src/api/v2/categories.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { categoryFixture, categoryFixture2, categoryFixture3 } from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CLS = "cls-100";
const CAT = "cat-001";
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
// fetchCategory
// ============================================================================

describe("fetchCategory", () => {
  it("GETs the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(categoryFixture);
    });
    const result = await run(fetchCategory(testConfig, client, CLS, CAT));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/categories/${CAT}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe(categoryFixture.id);
    expect(result.title).toBe("Homework");
    expect(result.weight).toBe(0.25);
  });

  it("returns EdlinkApiError on 404, EdlinkDecodeError on bad schema", async () => {
    const err404 = await runFail(
      fetchCategory(
        testConfig,
        makeTestHttpClient(() => fail(404)),
        CLS,
        CAT,
      ),
    );
    expect(err404).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      fetchCategory(
        testConfig,
        makeTestHttpClient(() => single({ id: "x" })),
        CLS,
        CAT,
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// createCategory
// ============================================================================

describe("createCategory", () => {
  const body = { title: "Quizzes", weight: 0.15, drop_lowest: 1 };

  it("POSTs to the correct URL with auth and decodes the response", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(categoryFixture);
    });
    const result = await run(createCategory(testConfig, client, CLS, body));

    expect(req.method).toBe("POST");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/categories`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.id).toBe(categoryFixture.id);
  });

  it("returns EdlinkApiError on 400, EdlinkDecodeError on bad schema", async () => {
    const err400 = await runFail(
      createCategory(
        testConfig,
        makeTestHttpClient(() => fail(400)),
        CLS,
        body,
      ),
    );
    expect(err400).toBeInstanceOf(EdlinkApiError);

    const errDecode = await runFail(
      createCategory(
        testConfig,
        makeTestHttpClient(() => single({ id: "x" })),
        CLS,
        body,
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// updateCategory
// ============================================================================

describe("updateCategory", () => {
  const patch = { title: "Updated", weight: 0.3 };
  const updated = { ...categoryFixture, ...patch };

  it("PATCHes the correct URL with auth and returns updated fields", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return single(updated);
    });
    const result = await run(updateCategory(testConfig, client, CLS, CAT, patch));

    expect(req.method).toBe("PATCH");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/categories/${CAT}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result.title).toBe("Updated");
    expect(result.weight).toBe(0.3);
  });

  it("returns EdlinkApiError on 404", async () => {
    const err = await runFail(
      updateCategory(
        testConfig,
        makeTestHttpClient(() => fail(404)),
        CLS,
        CAT,
        patch,
      ),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });
});

// ============================================================================
// deleteCategory
// ============================================================================

describe("deleteCategory", () => {
  it("DELETEs the correct URL with auth and resolves void", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return { status: 200 };
    });
    const result = await run(deleteCategory(testConfig, client, CLS, CAT));

    expect(req.method).toBe("DELETE");
    expect(req.url).toBe(`${BASE}/v2/graph/classes/${CLS}/categories/${CAT}`);
    expect(req.headers.authorization).toBe("Bearer test-secret");
    expect(result).toBeUndefined();
  });

  it("returns EdlinkApiError on 404", async () => {
    const err = await runFail(
      deleteCategory(
        testConfig,
        makeTestHttpClient(() => fail(404)),
        CLS,
        CAT,
      ),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });
});

// ============================================================================
// listCategories (paginated stream)
// ============================================================================

describe("listCategories", () => {
  it("streams items across pages; returns empty for no data", async () => {
    const empty = await collect(
      listCategories(
        testConfig,
        makeTestHttpClient(() => page([])),
        CLS,
        { type: "all" },
      ),
    );
    expect(empty).toHaveLength(0);

    const items = await collect(
      listCategories(
        testConfig,
        makeTestHttpClient(() => page([categoryFixture, categoryFixture2])),
        CLS,
        { type: "all" },
      ),
    );
    expect(items).toHaveLength(2);
    expect(items[0]!.id).toBe("cat-001");
    expect(items[1]!.id).toBe("cat-002");

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([categoryFixture], `${BASE}/next?cursor=p2`) : page([categoryFixture2]);
    };
    const multiItems = await collect(listCategories(testConfig, makeTestHttpClient(multi), CLS, { type: "all" }));
    expect(multiItems).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords pagination limits", async () => {
    let pc = 0;
    const byPages = await collect(
      listCategories(
        testConfig,
        makeTestHttpClient(() => {
          pc++;
          return page([{ ...categoryFixture, id: `c-${pc}` }], `${BASE}/next?p=${pc + 1}`);
        }),
        CLS,
        { type: "pages", maxPages: 2 },
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listCategories(
        testConfig,
        makeTestHttpClient(() => {
          rc++;
          return page(
            [
              { ...categoryFixture, id: `r-${rc}a` },
              { ...categoryFixture2, id: `r-${rc}b` },
              { ...categoryFixture3, id: `r-${rc}c` },
            ],
            `${BASE}/next?p=${rc + 1}`,
          );
        }),
        CLS,
        { type: "records", maxRecords: 5 },
      ),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err500 = await collectFail(
      listCategories(
        testConfig,
        makeTestHttpClient(() => fail(500)),
        CLS,
        { type: "all" },
      ),
    );
    expect(err500).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listCategories(
        testConfig,
        makeTestHttpClient(() => page([{ id: "bad" }])),
        CLS,
        { type: "all" },
      ),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
