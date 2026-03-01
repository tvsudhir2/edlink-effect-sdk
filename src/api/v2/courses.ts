import type { Effect, Stream } from "effect";

import { fetchOne, type RequestContext } from "@/api/v2/request.js";
import { createPaginatedStream } from "@/api/v2/stream.js";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { EdlinkClass } from "@/schemas/class.js";
import { EdlinkClass as ClassSchema } from "@/schemas/class.js";
import type { Course } from "@/schemas/course.js";
import { Course as CourseSchema } from "@/schemas/course.js";

const BASE = "/v2/graph/courses";

export interface ListCourseSubResourceOptions {
  readonly courseId: string;
  readonly pagination: PaginationConfig;
}

export const listCourses = (
  pagination: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<Course, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: BASE, schema: CourseSchema }, pagination, ctx);

export const fetchCourse = (
  courseId: string,
  ctx: RequestContext,
): Effect.Effect<Course, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: `${BASE}/${courseId}`, schema: CourseSchema }, ctx);

export const listCourseClasses = (
  options: ListCourseSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.courseId}/classes`, schema: ClassSchema }, options.pagination, ctx);
