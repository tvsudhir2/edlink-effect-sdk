/**
 * Example 3 — Process Classes Sequentially (Memory-Efficient)
 *
 * Strategy : Stream processing — one item at a time
 * Memory   : Very low (each item is processed then discarded)
 * Use-case : Large datasets, pipeline processing, real-time feeds
 *
 * Run: pnpm ex-3
 */

import { NodeRuntime } from "@effect/platform-node";
import { Effect, Stream } from "effect";
import { EdlinkClient } from "../src/client.js";
import { EdlinkLive } from "../src/layers.js";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Example 3: Process classes sequentially (memory-efficient)");

  const client = yield* EdlinkClient;
  let count = 0;

  yield* Stream.runForEach(client.classes.list(), (cls) =>
    Effect.gen(function* () {
      count++;
      if (count === 1 || count % 10 === 0) {
        yield* Effect.log(`  #${count}  id=${cls.id}  name=${cls.name ?? "(unnamed)"}`);
      }
    }),
  );

  yield* Effect.log(`Processed ${count} classes sequentially`);
}).pipe(Effect.provide(EdlinkLive));

NodeRuntime.runMain(program);
