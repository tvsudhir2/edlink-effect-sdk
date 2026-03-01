import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { Submission } from "@/schemas/submission.js";
import { Submission as SubmissionSchema } from "@/schemas/submission.js";
import { createOne, fetchOne, type RequestContext, updateOne } from "@/api/v2/request.js";
import { createPaginatedStream } from "@/api/v2/stream.js";

const submissionsPath = (classId: string, assignmentId: string) =>
  `/v2/graph/classes/${classId}/assignments/${assignmentId}/submissions`;

const submissionPath = (classId: string, assignmentId: string, submissionId: string) =>
  `/v2/graph/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}`;

// ---------------------------------------------------------------------------
// Options types
// ---------------------------------------------------------------------------

export interface ListSubmissionsOptions {
  readonly classId: string;
  readonly assignmentId: string;
  readonly pagination: PaginationConfig;
}

export interface FetchSubmissionOptions {
  readonly classId: string;
  readonly assignmentId: string;
  readonly submissionId: string;
}

export interface SubmitAttemptOptions {
  readonly classId: string;
  readonly assignmentId: string;
  readonly body: Record<string, unknown>;
}

export interface ReclaimSubmissionOptions {
  readonly classId: string;
  readonly assignmentId: string;
}

export interface ReturnSubmissionOptions {
  readonly classId: string;
  readonly assignmentId: string;
  readonly submissionId: string;
}

export interface UpdateSubmissionOptions {
  readonly classId: string;
  readonly assignmentId: string;
  readonly submissionId: string;
  readonly body: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export const listSubmissions = (
  options: ListSubmissionsOptions,
  ctx: RequestContext,
): Stream.Stream<Submission, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: submissionsPath(options.classId, options.assignmentId), schema: SubmissionSchema },
    options.pagination,
    ctx,
  );

export const fetchSubmission = (
  options: FetchSubmissionOptions,
  ctx: RequestContext,
): Effect.Effect<Submission, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(
    { path: submissionPath(options.classId, options.assignmentId, options.submissionId), schema: SubmissionSchema },
    ctx,
  );

export const submitAttempt = (
  options: SubmitAttemptOptions,
  ctx: RequestContext,
): Effect.Effect<Submission, EdlinkApiError | EdlinkDecodeError> =>
  createOne(
    {
      path: `/v2/graph/classes/${options.classId}/assignments/${options.assignmentId}/submit`,
      schema: SubmissionSchema,
    },
    options.body,
    ctx,
  );

export const reclaimSubmission = (
  options: ReclaimSubmissionOptions,
  ctx: RequestContext,
): Effect.Effect<Submission, EdlinkApiError | EdlinkDecodeError> =>
  createOne(
    {
      path: `/v2/graph/classes/${options.classId}/assignments/${options.assignmentId}/reclaim`,
      schema: SubmissionSchema,
    },
    {},
    ctx,
  );

export const returnSubmission = (
  options: ReturnSubmissionOptions,
  ctx: RequestContext,
): Effect.Effect<Submission, EdlinkApiError | EdlinkDecodeError> =>
  createOne(
    {
      path: `${submissionPath(options.classId, options.assignmentId, options.submissionId)}/return`,
      schema: SubmissionSchema,
    },
    {},
    ctx,
  );

export const updateSubmission = (
  options: UpdateSubmissionOptions,
  ctx: RequestContext,
): Effect.Effect<Submission, EdlinkApiError | EdlinkDecodeError> =>
  updateOne(
    {
      path: submissionPath(options.classId, options.assignmentId, options.submissionId),
      schema: SubmissionSchema,
    },
    options.body,
    ctx,
  );
