/**
 * Example 1 — Fetch Events with Default Pagination (3 pages)
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
  yield* Effect.logInfo("Example 1: Fetch events — default 3-page limit");

  const client = yield* EdlinkClient;

  const events = yield* client.getEventsStream().pipe(Stream.runCollect, Effect.map(Chunk.toArray));

  yield* Effect.log(`Fetched ${events.length} events`);

  yield* Effect.forEach(events.slice(0, 3), (evt, idx) => Effect.log(`  ${idx + 1}. id=${evt.id}  type=${evt.type}`));
}).pipe(Effect.provide(EdlinkLive), Effect.timeout(Duration.seconds(12)));

NodeRuntime.runMain(program);
