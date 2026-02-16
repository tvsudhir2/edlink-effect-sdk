import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Assignment } from "../../schemas/assignment.js";
import { Assignment as AssignmentSchema } from "../../schemas/assignment.js";
import { createOne, deleteOne, fetchOne, type RequestContext, updateOne } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const classAssignmentsPath = (classId: string) => `/v2/graph/classes/${classId}/assignments`;

const classAssignmentPath = (classId: string, assignmentId: string) =>
  `/v2/graph/classes/${classId}/assignments/${assignmentId}`;

// ---------------------------------------------------------------------------
// Options types
// ---------------------------------------------------------------------------

export interface ListAssignmentsOptions {
  readonly classId: string;
  readonly pagination: PaginationConfig;
}

export interface FetchAssignmentOptions {
  readonly classId: string;
  readonly assignmentId: string;
}

export interface CreateAssignmentOptions {
  readonly classId: string;
  readonly body: Record<string, unknown>;
}

export interface UpdateAssignmentOptions {
  readonly classId: string;
  readonly assignmentId: string;
  readonly body: Record<string, unknown>;
}

export interface DeleteAssignmentOptions {
  readonly classId: string;
  readonly assignmentId: string;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export const listAssignments = (
  options: ListAssignmentsOptions,
  ctx: RequestContext,
): Stream.Stream<Assignment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: classAssignmentsPath(options.classId), schema: AssignmentSchema },
    options.pagination,
    ctx,
  );

export const fetchAssignment = (
  options: FetchAssignmentOptions,
  ctx: RequestContext,
): Effect.Effect<Assignment, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: classAssignmentPath(options.classId, options.assignmentId), schema: AssignmentSchema }, ctx);

export const createAssignment = (
  options: CreateAssignmentOptions,
  ctx: RequestContext,
): Effect.Effect<Assignment, EdlinkApiError | EdlinkDecodeError> =>
  createOne({ path: classAssignmentsPath(options.classId), schema: AssignmentSchema }, options.body, ctx);

export const updateAssignment = (
  options: UpdateAssignmentOptions,
  ctx: RequestContext,
): Effect.Effect<Assignment, EdlinkApiError | EdlinkDecodeError> =>
  updateOne(
    { path: classAssignmentPath(options.classId, options.assignmentId), schema: AssignmentSchema },
    options.body,
    ctx,
  );

export const deleteAssignment = (
  options: DeleteAssignmentOptions,
  ctx: RequestContext,
): Effect.Effect<void, EdlinkApiError> => deleteOne(classAssignmentPath(options.classId, options.assignmentId), ctx);
