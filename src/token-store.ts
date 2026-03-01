import { Effect, HashMap, Layer, type Option, Ref, ServiceMap } from "effect";
import type { TokenData } from "@/schemas/token.js";

// ---------------------------------------------------------------------------
// TokenStore — pluggable per-user token persistence
// ---------------------------------------------------------------------------

/**
 * Service interface for storing and retrieving per-user OAuth tokens.
 *
 * Consumers can provide their own implementation (Redis, database, etc.)
 * by supplying a custom `Layer<TokenStore>`. The SDK ships with an
 * in-memory default suitable for development and single-process use.
 */
export interface TokenStoreShape {
  /** Retrieve stored tokens for a user, or `None` if not found */
  readonly get: (userId: string) => Effect.Effect<Option.Option<TokenData>>;

  /** Store (or overwrite) tokens for a user */
  readonly set: (userId: string, tokenData: TokenData) => Effect.Effect<void>;

  /** Remove stored tokens for a user */
  readonly delete: (userId: string) => Effect.Effect<void>;
}

export class TokenStore extends ServiceMap.Service<TokenStore, TokenStoreShape>()("TokenStore") {}

// ---------------------------------------------------------------------------
// InMemoryTokenStore — default implementation
// ---------------------------------------------------------------------------

/**
 * In-memory token store using an Effect `Ref<HashMap>`.
 *
 * Suitable for development, testing, and single-process deployments.
 * Tokens are lost when the process restarts.
 */
export const InMemoryTokenStoreLive: Layer.Layer<TokenStore> = Layer.effect(
  TokenStore,
  Effect.gen(function* () {
    const storeRef = yield* Ref.make(HashMap.empty<string, TokenData>());

    return {
      get: (userId: string) => Ref.get(storeRef).pipe(Effect.map((store) => HashMap.get(store, userId))),

      set: (userId: string, tokenData: TokenData) =>
        Ref.update(storeRef, (store) => HashMap.set(store, userId, tokenData)),

      delete: (userId: string) => Ref.update(storeRef, (store) => HashMap.remove(store, userId)),
    };
  }),
);
