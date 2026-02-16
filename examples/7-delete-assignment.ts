/**
 * Example 7 — Delete an Assignment
 *
 * Strategy : Single DELETE — remove an assignment from a class
 * Use-case : Teacher removing a draft or cancelled assignment
 *
 * Set CLASS_ID and ASSIGNMENT_ID in your .env.local file.
 *
 * Run: pnpm ex-7
 */

import { NodeRuntime } from "@effect/platform-node";
import { Config, Duration, Effect } from "effect";
import { EdlinkClient } from "../src/client.js";
import { EdlinkLive } from "../src/layers.js";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Example 7: Delete an assignment");

  const classId = yield* Config.string("CLASS_ID");
  const assignmentId = yield* Config.string("ASSIGNMENT_ID");
  const client = yield* EdlinkClient;

  // Verify the assignment exists first
  const assignment = yield* client.assignments.fetch(classId, assignmentId);
  yield* Effect.log(`Found assignment: id=${assignment.id}  title="${assignment.title}"`);

  // Delete it
  yield* client.assignments.delete(classId, assignmentId);
  yield* Effect.log(`Assignment ${assignmentId} deleted successfully`);
}).pipe(Effect.provide(EdlinkLive), Effect.timeout(Duration.seconds(12)));

NodeRuntime.runMain(program);
