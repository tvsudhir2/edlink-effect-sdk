import { Effect, Stream } from "effect";
import { HttpClient } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Submission } from "../../schemas/submission.js";
import { PaginatedSubmissionsSchema } from "../../schemas/paginated.js";
import { Submission as SubmissionSchema } from "../../schemas/submission.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne, createOne, updateOne } from "./request.js";

const submissionsPath = (classId: string, assignmentId: string) =>
  `/v2/graph/classes/${classId}/assignments/${assignmentId}/submissions`;

const submissionPath = (classId: string, assignmentId: string, submissionId: string) =>
  `/v2/graph/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}`;

export const listSubmissions = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  assignmentId: string,
  pagination: PaginationConfig,
): Stream.Stream<Submission, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, submissionsPath(classId, assignmentId), PaginatedSubmissionsSchema, pagination);

export const fetchSubmission = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  assignmentId: string,
  submissionId: string,
): Effect.Effect<Submission, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, submissionPath(classId, assignmentId, submissionId), SubmissionSchema);

export const submitAttempt = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  assignmentId: string,
  body: Record<string, unknown>,
): Effect.Effect<Submission, EdlinkApiError | EdlinkDecodeError> =>
  createOne(
    config,
    httpClient,
    `/v2/graph/classes/${classId}/assignments/${assignmentId}/submit`,
    SubmissionSchema,
    body,
  );

export const reclaimSubmission = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  assignmentId: string,
): Effect.Effect<Submission, EdlinkApiError | EdlinkDecodeError> =>
  createOne(
    config,
    httpClient,
    `/v2/graph/classes/${classId}/assignments/${assignmentId}/reclaim`,
    SubmissionSchema,
    {},
  );

export const returnSubmission = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  assignmentId: string,
  submissionId: string,
): Effect.Effect<Submission, EdlinkApiError | EdlinkDecodeError> =>
  createOne(
    config,
    httpClient,
    `${submissionPath(classId, assignmentId, submissionId)}/return`,
    SubmissionSchema,
    {},
  );

export const updateSubmission = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  assignmentId: string,
  submissionId: string,
  body: Record<string, unknown>,
): Effect.Effect<Submission, EdlinkApiError | EdlinkDecodeError> =>
  updateOne(config, httpClient, submissionPath(classId, assignmentId, submissionId), SubmissionSchema, body);
