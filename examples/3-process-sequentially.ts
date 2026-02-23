/**
 * Example 3 — Process Classes Sequentially (Memory-Efficient)
 *
 * Strategy : Stream processing — one item at a time
 * Memory   : Very low (each item is processed then discarded)
 * Use-case : Large datasets, pipeline processing, real-time feeds
 *
 * State    : Uses a plain `let` counter — safe because Stream.runForEach
 *            processes strictly one item at a time (no concurrent fibers).
 *            Compare with Example 4 where concurrent fibers require Ref
 *            to prevent lost updates via atomic read-modify-write.
 *
 * Run: pnpm ex-3
 */

import { NodeRuntime } from "@effect/platform-node";
import { Effect, Stream } from "effect";
import { EdlinkClient } from "../src/client.js";
import { EdlinkLive } from "../src/layers.js";
import type { EdlinkClass } from "../src/schemas/class.js";

const processClass = Effect.fn("processClass")((cls: EdlinkClass, count: number) => {
  if (count === 1 || count % 10 === 0) {
    return Effect.log(`  #${count}  id=${cls.id}  name=${cls.name ?? "(unnamed)"}`);
  }
  return Effect.void;
});

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Example 3: Process classes sequentially (memory-efficient)");

  const client = yield* EdlinkClient;

  // Plain `let` is safe here — sequential processing means only one fiber ever
  // touches this variable at a time. No atomic update needed (contrast: Example 4).
  let count = 0;

  yield* client.classes.list().pipe(Stream.runForEach((cls) => processClass(cls, ++count)));

  yield* Effect.log(`Processed ${count} classes sequentially`);
}).pipe(Effect.provide(EdlinkLive));

NodeRuntime.runMain(program);
