/**
 * Example 6 — Create an Assignment
 *
 * Strategy : Single POST — create a new assignment in a class
 * Use-case : Teacher creating homework from an LMS integration
 *
 * Set CLASS_ID in your .env.local file.
 *
 * Run: pnpm ex-6
 */

import { NodeRuntime } from "@effect/platform-node";
import { Config, Duration, Effect } from "effect";

import { EdlinkClient } from "@/client.js";
import { EdlinkLive } from "@/layers.js";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Example 6: Create a new assignment");

  const classId = yield* Config.string("CLASS_ID");
  const client = yield* EdlinkClient;

  const assignment = yield* client.assignments.create(classId, {
    title: "Chapter 5 Reading Quiz",
    description: "<p>Complete the reading quiz for Chapter 5.</p>",
    description_plaintext: "Complete the reading quiz for Chapter 5.",
    state: "upcoming",
    assignee_mode: "all",
    points_possible: 20,
    grading_type: "points",
    submission_types: ["online_quiz"],
    max_attempts: 2,
    due_date: "2026-03-01T23:59:00.000Z",
    display_date: "2026-02-20T08:00:00.000Z",
  });

  yield* Effect.log(`Created assignment:`);
  yield* Effect.log(`  id    = ${assignment.id}`);
  yield* Effect.log(`  title = ${assignment.title}`);
  yield* Effect.log(`  state = ${assignment.state}`);
  yield* Effect.log(`  due   = ${assignment.due_date}`);
}).pipe(Effect.provide(EdlinkLive), Effect.timeout(Duration.seconds(12)));

NodeRuntime.runMain(program);
