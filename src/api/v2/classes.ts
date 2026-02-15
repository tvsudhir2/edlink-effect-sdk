import { Effect, Stream } from "effect";
import { HttpClient } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { EdlinkClass } from "../../schemas/class.js";
import type { Section } from "../../schemas/section.js";
import type { Enrollment } from "../../schemas/enrollment.js";
import type { Person } from "../../schemas/person.js";
import {
  PaginatedClassesSchema,
  PaginatedSectionsSchema,
  PaginatedEnrollmentsSchema,
  PaginatedPeopleSchema,
} from "../../schemas/paginated.js";
import { EdlinkClass as ClassSchema } from "../../schemas/class.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne } from "./request.js";

const BASE = "/v2/graph/classes";

export const listClasses = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, PaginatedClassesSchema, pagination);

export const fetchClass = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
): Effect.Effect<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, `${BASE}/${classId}`, ClassSchema);

export const listClassSections = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Section, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${classId}/sections`, PaginatedSectionsSchema, pagination);

export const listClassEnrollments = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${classId}/enrollments`, PaginatedEnrollmentsSchema, pagination);

export const listClassPeople = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${classId}/people`, PaginatedPeopleSchema, pagination);

export const listClassTeachers = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${classId}/teachers`, PaginatedPeopleSchema, pagination);

export const listClassStudents = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${classId}/students`, PaginatedPeopleSchema, pagination);
