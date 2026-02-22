/**
 * Example 1 — Fetch Classes with Default Pagination (3 pages)
 *
 * Strategy : Default pages
 * Memory   : Low (only 3 pages loaded)
 * Use-case : Quick sampling, testing, lightweight queries
 *
 * Run: pnpm ex-1
 */

import { NodeRuntime } from "@effect/platform-node";
import { Chunk, Duration, Effect, Stream } from "effect";
import { EdlinkClient } from "../src/client.js";
import { EdlinkLive } from "../src/layers.js";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Example 1: Fetch classes — default 3-page limit");

  const client = yield* EdlinkClient;

  const classes = yield* client.classes.list().pipe(Stream.runCollect, Effect.map(Chunk.toArray));

  yield* Effect.log(`Fetched ${classes.length} classes`);

  yield* Effect.forEach(classes.slice(0, 3), (cls, idx) => Effect.log(`  ${idx + 1}. id=${cls.id}  name=${cls.name ?? "(unnamed)"}`));
}).pipe(Effect.provide(EdlinkLive), Effect.timeout(Duration.seconds(12)));

NodeRuntime.runMain(program);
