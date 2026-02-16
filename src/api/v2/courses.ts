import type { HttpClient } from "@effect/platform";
import type { Effect, Stream } from "effect";
import type { EdlinkConfigData } from "../../config.js";
import type { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { EdlinkClass } from "../../schemas/class.js";
import { EdlinkClass as ClassSchema } from "../../schemas/class.js";
import type { Course } from "../../schemas/course.js";
import { Course as CourseSchema } from "../../schemas/course.js";
import { fetchOne } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const BASE = "/v2/graph/courses";

export const listCourses = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<Course, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, CourseSchema, pagination);

export const fetchCourse = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  courseId: string,
): Effect.Effect<Course, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, `${BASE}/${courseId}`, CourseSchema);

export const listCourseClasses = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  courseId: string,
  pagination: PaginationConfig,
): Stream.Stream<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${courseId}/classes`, ClassSchema, pagination);
