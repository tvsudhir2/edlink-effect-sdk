/**
 * Example 3 — Fetch Events with Max Record Limit (50)
 *
 * Strategy : Record cap
 * Memory   : Predictable (stops at exactly N records)
 * Use-case : Batch processing, pagination UIs, controlled ingestion
 *
 * Run: pnpm ex-3
 */
import { Effect, Stream, Chunk } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { EdlinkClient } from "../src/client.js";
import { EdlinkLive } from "../src/layers.js";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Example 3: Fetch events — max 50 records");

  const client = yield* EdlinkClient;

  const events = yield* client
    .getEventsStream({ type: "records", maxRecords: 50 })
    .pipe(Stream.runCollect, Effect.map(Chunk.toArray));

  yield* Effect.log(`Fetched ${events.length} events (capped at 50)`);

  yield* Effect.forEach(events.slice(0, 3), (evt, idx) =>
    Effect.log(`  ${idx + 1}. id=${evt.id}  type=${evt.type}`),
  );
}).pipe(Effect.provide(EdlinkLive));

NodeRuntime.runMain(program);
