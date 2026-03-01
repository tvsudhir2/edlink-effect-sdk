import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { EdlinkClass } from "@/schemas/class.js";
import { EdlinkClass as ClassSchema } from "@/schemas/class.js";
import type { Course } from "@/schemas/course.js";
import { Course as CourseSchema } from "@/schemas/course.js";
import type { Person } from "@/schemas/person.js";
import { Person as PersonSchema } from "@/schemas/person.js";
import type { School } from "@/schemas/school.js";
import { School as SchoolSchema } from "@/schemas/school.js";
import type { Session } from "@/schemas/session.js";
import { Session as SessionSchema } from "@/schemas/session.js";
import { fetchOne, type RequestContext } from "@/api/v2/request.js";
import { createPaginatedStream } from "@/api/v2/stream.js";

const BASE = "/v2/graph/schools";

export interface ListSchoolSubResourceOptions {
  readonly schoolId: string;
  readonly pagination: PaginationConfig;
}

export const listSchools = (
  pagination: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<School, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: BASE, schema: SchoolSchema }, pagination, ctx);

export const fetchSchool = (
  schoolId: string,
  ctx: RequestContext,
): Effect.Effect<School, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: `${BASE}/${schoolId}`, schema: SchoolSchema }, ctx);

export const listSchoolClasses = (
  options: ListSchoolSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.schoolId}/classes`, schema: ClassSchema }, options.pagination, ctx);

export const listSchoolCourses = (
  options: ListSchoolSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Course, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.schoolId}/courses`, schema: CourseSchema }, options.pagination, ctx);

export const listSchoolSessions = (
  options: ListSchoolSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Session, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.schoolId}/sessions`, schema: SessionSchema },
    options.pagination,
    ctx,
  );

export const listSchoolPeople = (
  options: ListSchoolSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.schoolId}/people`, schema: PersonSchema }, options.pagination, ctx);

export const listSchoolAdministrators = (
  options: ListSchoolSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.schoolId}/administrators`, schema: PersonSchema },
    options.pagination,
    ctx,
  );

export const listSchoolTeachers = (
  options: ListSchoolSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.schoolId}/teachers`, schema: PersonSchema },
    options.pagination,
    ctx,
  );

export const listSchoolStudents = (
  options: ListSchoolSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.schoolId}/students`, schema: PersonSchema },
    options.pagination,
    ctx,
  );
