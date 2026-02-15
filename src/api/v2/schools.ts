import { Effect, Stream } from "effect";
import { HttpClient } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { School } from "../../schemas/school.js";
import type { EdlinkClass } from "../../schemas/class.js";
import type { Course } from "../../schemas/course.js";
import type { Session } from "../../schemas/session.js";
import type { Person } from "../../schemas/person.js";
import { School as SchoolSchema } from "../../schemas/school.js";
import { EdlinkClass as ClassSchema } from "../../schemas/class.js";
import { Course as CourseSchema } from "../../schemas/course.js";
import { Session as SessionSchema } from "../../schemas/session.js";
import { Person as PersonSchema } from "../../schemas/person.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne } from "./request.js";

const BASE = "/v2/graph/schools";

export const listSchools = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<School, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, SchoolSchema, pagination);

export const fetchSchool = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
): Effect.Effect<School, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, `${BASE}/${schoolId}`, SchoolSchema);

export const listSchoolClasses = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/classes`, ClassSchema, pagination);

export const listSchoolCourses = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Course, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/courses`, CourseSchema, pagination);

export const listSchoolSessions = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Session, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/sessions`, SessionSchema, pagination);

export const listSchoolPeople = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/people`, PersonSchema, pagination);

export const listSchoolAdministrators = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/administrators`, PersonSchema, pagination);

export const listSchoolTeachers = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/teachers`, PersonSchema, pagination);

export const listSchoolStudents = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/students`, PersonSchema, pagination);
