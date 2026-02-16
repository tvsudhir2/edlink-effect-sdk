import type { HttpClient } from "@effect/platform";
import type { Effect, Stream } from "effect";
import type { EdlinkConfigData } from "../../config.js";
import type { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { EdlinkClass } from "../../schemas/class.js";
import { EdlinkClass as ClassSchema } from "../../schemas/class.js";
import type { Enrollment } from "../../schemas/enrollment.js";
import { Enrollment as EnrollmentSchema } from "../../schemas/enrollment.js";
import type { Person } from "../../schemas/person.js";
import { Person as PersonSchema } from "../../schemas/person.js";
import type { Section } from "../../schemas/section.js";
import { Section as SectionSchema } from "../../schemas/section.js";
import { fetchOne } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const BASE = "/v2/graph/classes";

export const listClasses = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, ClassSchema, pagination);

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
  createPaginatedStream(config, httpClient, `${BASE}/${classId}/sections`, SectionSchema, pagination);

export const listClassEnrollments = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${classId}/enrollments`, EnrollmentSchema, pagination);

export const listClassPeople = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${classId}/people`, PersonSchema, pagination);

export const listClassTeachers = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${classId}/teachers`, PersonSchema, pagination);

export const listClassStudents = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${classId}/students`, PersonSchema, pagination);
