/**
 * Example 4 — Process Classes Concurrently (High Throughput)
 *
 * Strategy : Concurrent stream processing — N items at a time
 * Memory   : Low (items are processed and discarded in batches)
 * Use-case : High-throughput pipelines, enriching records via API calls
 *
 * Contrast with Example 3 (sequential):
 *   - Example 3 processes one item at a time — no concurrency, `let count` would work
 *   - Example 4 processes 10 items simultaneously — `Ref` is required for atomic counting
 *     because multiple fibers read/write the counter at the same time.
 *
 * Run: pnpm ex-4
 */

import { NodeRuntime } from "@effect/platform-node";
import { Effect, Ref, Stream } from "effect";
import { EdlinkClient } from "../src/client.js";
import { EdlinkLive } from "../src/layers.js";
import type { EdlinkClass } from "../src/schemas/class.js";

const processClass = Effect.fn("processClass")((cls: EdlinkClass, countRef: Ref.Ref<number>) =>
  Effect.gen(function* () {
    // Simulate async work per item (e.g., enriching from another API)
    yield* Effect.sleep("10 millis");

    // Ref.updateAndGet is atomic — safe across concurrent fibers
    // A plain `let count++` would race here: two fibers could both read the
    // same value before either writes back, losing increments.
    const count = yield* Ref.updateAndGet(countRef, (n) => n + 1);
    if (count === 1 || count % 10 === 0) {
      yield* Effect.log(`  #${count}  id=${cls.id}  name=${cls.name ?? "(unnamed)"}`);
    }
  }),
);

const CONCURRENCY = 10;

const program = Effect.gen(function* () {
  yield* Effect.logInfo(`Example 4: Process classes concurrently (concurrency=${CONCURRENCY})`);

  const client = yield* EdlinkClient;
  const countRef = yield* Ref.make(0);

  yield* client.classes.list().pipe(
    Stream.mapEffect((cls) => processClass(cls, countRef), { concurrency: CONCURRENCY }),
    Stream.runDrain,
  );

  const total = yield* Ref.get(countRef);
  yield* Effect.log(`Processed ${total} classes concurrently (concurrency=${CONCURRENCY})`);
}).pipe(Effect.provide(EdlinkLive));

NodeRuntime.runMain(program);
