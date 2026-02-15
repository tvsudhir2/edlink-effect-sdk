/**
 * Example 6 — Update an Assignment
 *
 * Strategy : Single PATCH — update fields on an existing assignment
 * Use-case : Teacher extending the due date or changing points
 *
 * Set CLASS_ID and ASSIGNMENT_ID in your .env.local file.
 *
 * Run: pnpm ex-6
 */
import { Effect, Duration, Config } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { EdlinkClient } from "../src/client.js";
import { EdlinkLive } from "../src/layers.js";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Example 6: Update an existing assignment");

  const classId = yield* Config.string("CLASS_ID");
  const assignmentId = yield* Config.string("ASSIGNMENT_ID");
  const client = yield* EdlinkClient;

  // First, fetch the current assignment to show the "before" state
  const before = yield* client.assignments.fetch(classId, assignmentId);
  yield* Effect.log(`Before: title="${before.title}"  points=${before.points_possible}`);

  // Update: change title, increase points, extend due date
  const updated = yield* client.assignments.update(classId, assignmentId, {
    title: "Chapter 5 Reading Quiz (Extended)",
    points_possible: 25,
    due_date: "2026-03-08T23:59:00.000Z",
  });

  yield* Effect.log(`After:  title="${updated.title}"  points=${updated.points_possible}`);
  yield* Effect.log(`  due_date = ${updated.due_date}`);
}).pipe(
  Effect.provide(EdlinkLive),
  Effect.timeout(Duration.seconds(12)),
);

NodeRuntime.runMain(program);
