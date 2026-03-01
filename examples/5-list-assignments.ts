/**
 * Example 5 — List Assignments for a Class
 *
 * Strategy : Paginated stream — collect all assignments for a class
 * Memory   : Low (default 3-page limit)
 * Use-case : Viewing assignments in a class dashboard
 *
 * Set CLASS_ID in your .env.local file.
 *
 * Run: pnpm ex-5
 */

import { NodeRuntime } from "@effect/platform-node";
import { Config, Duration, Effect, Stream } from "effect";
import { EdlinkClient } from "@/client.js";
import { EdlinkLive } from "@/layers.js";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Example 5: List assignments for a class");

  const classId = yield* Config.string("CLASS_ID");
  const client = yield* EdlinkClient;

  const assignments = yield* client.assignments.list(classId).pipe(Stream.runCollect);

  yield* Effect.log(`Fetched ${assignments.length} assignments`);

  yield* Effect.forEach(assignments.slice(0, 5), (a, idx) =>
    Effect.log(`  ${idx + 1}. id=${a.id}  title="${a.title}"  state=${a.state}  points=${a.points_possible}`),
  );
}).pipe(Effect.provide(EdlinkLive), Effect.timeout(Duration.seconds(12)));

NodeRuntime.runMain(program);
