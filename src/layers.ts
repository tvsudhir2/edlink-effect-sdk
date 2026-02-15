import { Layer } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { EdlinkConfig } from "./config.js";
import { EdlinkClientLive } from "./client.js";

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
export const EdlinkLive = EdlinkClientLive.pipe(
  Layer.provide(EdlinkConfig.Live),
  Layer.provide(FetchHttpClient.layer),
);
