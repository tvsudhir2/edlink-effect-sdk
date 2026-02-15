import { Effect, Stream } from "effect";
import { HttpClient } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Assignment } from "../../schemas/assignment.js";
import { PaginatedAssignmentsSchema } from "../../schemas/paginated.js";
import { Assignment as AssignmentSchema } from "../../schemas/assignment.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne, createOne, updateOne, deleteOne } from "./request.js";

const classAssignmentsPath = (classId: string) =>
  `/v2/graph/classes/${classId}/assignments`;

const classAssignmentPath = (classId: string, assignmentId: string) =>
  `/v2/graph/classes/${classId}/assignments/${assignmentId}`;

export const listAssignments = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Assignment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, classAssignmentsPath(classId), PaginatedAssignmentsSchema, pagination);

export const fetchAssignment = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  assignmentId: string,
): Effect.Effect<Assignment, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, classAssignmentPath(classId, assignmentId), AssignmentSchema);

export const createAssignment = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  body: Record<string, unknown>,
): Effect.Effect<Assignment, EdlinkApiError | EdlinkDecodeError> =>
  createOne(config, httpClient, classAssignmentsPath(classId), AssignmentSchema, body);

export const updateAssignment = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  assignmentId: string,
  body: Record<string, unknown>,
): Effect.Effect<Assignment, EdlinkApiError | EdlinkDecodeError> =>
  updateOne(config, httpClient, classAssignmentPath(classId, assignmentId), AssignmentSchema, body);

export const deleteAssignment = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  assignmentId: string,
): Effect.Effect<void, EdlinkApiError> =>
  deleteOne(config, httpClient, classAssignmentPath(classId, assignmentId));
