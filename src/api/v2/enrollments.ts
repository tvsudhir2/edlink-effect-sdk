import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Enrollment } from "../../schemas/enrollment.js";
import { Enrollment as EnrollmentSchema } from "../../schemas/enrollment.js";
import { fetchOne, type RequestContext } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const BASE = "/v2/graph/enrollments";

export const listEnrollments = (
  pagination: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: BASE, schema: EnrollmentSchema }, pagination, ctx);

export const fetchEnrollment = (
  enrollmentId: string,
  ctx: RequestContext,
): Effect.Effect<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: `${BASE}/${enrollmentId}`, schema: EnrollmentSchema }, ctx);
