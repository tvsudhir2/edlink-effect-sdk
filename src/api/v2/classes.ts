import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { EdlinkClass } from "@/schemas/class.js";
import { EdlinkClass as ClassSchema } from "@/schemas/class.js";
import type { Enrollment } from "@/schemas/enrollment.js";
import { Enrollment as EnrollmentSchema } from "@/schemas/enrollment.js";
import type { Person } from "@/schemas/person.js";
import { Person as PersonSchema } from "@/schemas/person.js";
import type { Section } from "@/schemas/section.js";
import { Section as SectionSchema } from "@/schemas/section.js";
import { fetchOne, type RequestContext } from "@/api/v2/request.js";
import { createPaginatedStream } from "@/api/v2/stream.js";

const BASE = "/v2/graph/classes";

export interface ListClassSubResourceOptions {
  readonly classId: string;
  readonly pagination: PaginationConfig;
}

export const listClasses = (
  pagination: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: BASE, schema: ClassSchema }, pagination, ctx);

export const fetchClass = (
  classId: string,
  ctx: RequestContext,
): Effect.Effect<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: `${BASE}/${classId}`, schema: ClassSchema }, ctx);

export const listClassSections = (
  options: ListClassSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Section, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.classId}/sections`, schema: SectionSchema },
    options.pagination,
    ctx,
  );

export const listClassEnrollments = (
  options: ListClassSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.classId}/enrollments`, schema: EnrollmentSchema },
    options.pagination,
    ctx,
  );

export const listClassPeople = (
  options: ListClassSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.classId}/people`, schema: PersonSchema }, options.pagination, ctx);

export const listClassTeachers = (
  options: ListClassSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.classId}/teachers`, schema: PersonSchema }, options.pagination, ctx);

export const listClassStudents = (
  options: ListClassSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.classId}/students`, schema: PersonSchema }, options.pagination, ctx);
