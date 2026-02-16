import type { HttpClient } from "@effect/platform";
import type { Effect, Stream } from "effect";
import type { EdlinkConfigData } from "../../config.js";
import type { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Enrollment } from "../../schemas/enrollment.js";
import { Enrollment as EnrollmentSchema } from "../../schemas/enrollment.js";
import { fetchOne } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const BASE = "/v2/graph/enrollments";

export const listEnrollments = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, EnrollmentSchema, pagination);

export const fetchEnrollment = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  enrollmentId: string,
): Effect.Effect<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, `${BASE}/${enrollmentId}`, EnrollmentSchema);
