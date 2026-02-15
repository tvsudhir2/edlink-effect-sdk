import { Effect, Stream } from "effect";
import { HttpClient } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Enrollment } from "../../schemas/enrollment.js";
import { PaginatedEnrollmentsSchema } from "../../schemas/paginated.js";
import { Enrollment as EnrollmentSchema } from "../../schemas/enrollment.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne } from "./request.js";

const BASE = "/v2/graph/enrollments";

export const listEnrollments = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, PaginatedEnrollmentsSchema, pagination);

export const fetchEnrollment = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  enrollmentId: string,
): Effect.Effect<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, `${BASE}/${enrollmentId}`, EnrollmentSchema);
