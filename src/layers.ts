import { FetchHttpClient } from "effect/unstable/http";
import { Layer } from "effect";
import { EdlinkClientLive } from "./client.js";
import { EdlinkConfig, EdlinkUserConfig } from "./config.js";
import { InMemoryTokenStoreLive } from "./token-store.js";
import { EdlinkUserClientLive } from "./user-client.js";

// ---------------------------------------------------------------------------
// Composed layer — single `Effect.provide(EdlinkLive)` in consumer code
// ---------------------------------------------------------------------------

/**
 * Fully-wired layer that provides `EdlinkClient` with all its transitive
 * dependencies (config + HTTP).
 *
 * Usage:
 * ```ts
 * myEffect.pipe(Effect.provide(EdlinkLive))
 * ```
 */
export const EdlinkLive = EdlinkClientLive.pipe(Layer.provide(EdlinkConfig.Live), Layer.provide(FetchHttpClient.layer));

// ---------------------------------------------------------------------------
// User API layer — OAuth + per-user token management
// ---------------------------------------------------------------------------

/**
 * Fully-wired layer that provides `EdlinkUserClient` with in-memory token
 * storage. Suitable for development and single-process deployments.
 *
 * For production, provide your own `TokenStore` layer:
 * ```ts
 * const MyUserLive = EdlinkUserClientLive.pipe(
 *   Layer.provide(EdlinkUserConfig.Live),
 *   Layer.provide(FetchHttpClient.layer),
 *   Layer.provide(MyRedisTokenStore),
 * );
 * ```
 */
export const EdlinkUserLive = EdlinkUserClientLive.pipe(
  Layer.provide(EdlinkUserConfig.Live),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(InMemoryTokenStoreLive),
);
