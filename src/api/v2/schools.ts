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
import {
  PaginatedSchoolsSchema,
  PaginatedClassesSchema,
  PaginatedCoursesSchema,
  PaginatedSessionsSchema,
  PaginatedPeopleSchema,
} from "../../schemas/paginated.js";
import { School as SchoolSchema } from "../../schemas/school.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne } from "./request.js";

const BASE = "/v2/graph/schools";

export const listSchools = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<School, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, PaginatedSchoolsSchema, pagination);

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
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/classes`, PaginatedClassesSchema, pagination);

export const listSchoolCourses = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Course, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/courses`, PaginatedCoursesSchema, pagination);

export const listSchoolSessions = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Session, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/sessions`, PaginatedSessionsSchema, pagination);

export const listSchoolPeople = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/people`, PaginatedPeopleSchema, pagination);

export const listSchoolAdministrators = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/administrators`, PaginatedPeopleSchema, pagination);

export const listSchoolTeachers = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/teachers`, PaginatedPeopleSchema, pagination);

export const listSchoolStudents = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  schoolId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${schoolId}/students`, PaginatedPeopleSchema, pagination);
