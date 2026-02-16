import { describe, it, expect } from "vitest";
import { Effect, Layer, Option } from "effect";
import { TokenStore, InMemoryTokenStoreLive } from "../src/token-store.js";
import { TokenData } from "../src/schemas/token.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const runWithStore = <A>(effect: Effect.Effect<A, never, TokenStore>) =>
  Effect.runPromise(Effect.provide(effect, InMemoryTokenStoreLive));

const makeToken = (accessToken: string, expiresAt: number): TokenData =>
  new TokenData({ accessToken, refreshToken: "refresh-abc", expiresAt });

// ============================================================================
// InMemoryTokenStore
// ============================================================================

describe("InMemoryTokenStore", () => {
  it("get returns None for unknown user", async () => {
    const result = await runWithStore(
      Effect.gen(function* () {
        const store = yield* TokenStore;
        return yield* store.get("unknown-user");
      }),
    );
    expect(Option.isNone(result)).toBe(true);
  });

  it("set then get returns Some with stored data", async () => {
    const token = makeToken("access-1", Date.now() + 3600_000);
    const result = await runWithStore(
      Effect.gen(function* () {
        const store = yield* TokenStore;
        yield* store.set("user-1", token);
        return yield* store.get("user-1");
      }),
    );
    expect(Option.isSome(result)).toBe(true);
    if (Option.isSome(result)) {
      expect(result.value.accessToken).toBe("access-1");
    }
  });

  it("set overwrites existing data", async () => {
    const token1 = makeToken("access-old", Date.now() + 3600_000);
    const token2 = makeToken("access-new", Date.now() + 7200_000);
    const result = await runWithStore(
      Effect.gen(function* () {
        const store = yield* TokenStore;
        yield* store.set("user-1", token1);
        yield* store.set("user-1", token2);
        return yield* store.get("user-1");
      }),
    );
    expect(Option.isSome(result)).toBe(true);
    if (Option.isSome(result)) {
      expect(result.value.accessToken).toBe("access-new");
    }
  });

  it("delete removes stored tokens", async () => {
    const token = makeToken("access-1", Date.now() + 3600_000);
    const result = await runWithStore(
      Effect.gen(function* () {
        const store = yield* TokenStore;
        yield* store.set("user-1", token);
        yield* store.delete("user-1");
        return yield* store.get("user-1");
      }),
    );
    expect(Option.isNone(result)).toBe(true);
  });

  it("delete on non-existent user is a no-op", async () => {
    const result = await runWithStore(
      Effect.gen(function* () {
        const store = yield* TokenStore;
        yield* store.delete("ghost");
        return yield* store.get("ghost");
      }),
    );
    expect(Option.isNone(result)).toBe(true);
  });

  it("stores multiple users independently", async () => {
    const result = await runWithStore(
      Effect.gen(function* () {
        const store = yield* TokenStore;
        yield* store.set("user-a", makeToken("a-token", Date.now() + 3600_000));
        yield* store.set("user-b", makeToken("b-token", Date.now() + 3600_000));
        yield* store.delete("user-a");
        const a = yield* store.get("user-a");
        const b = yield* store.get("user-b");
        return { a, b };
      }),
    );
    expect(Option.isNone(result.a)).toBe(true);
    expect(Option.isSome(result.b)).toBe(true);
    if (Option.isSome(result.b)) {
      expect(result.b.value.accessToken).toBe("b-token");
    }
  });
});
