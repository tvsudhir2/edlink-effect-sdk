import { Effect, Stream } from "effect";
import { HttpClient } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Section } from "../../schemas/section.js";
import type { Enrollment } from "../../schemas/enrollment.js";
import type { Person } from "../../schemas/person.js";
import {
  PaginatedSectionsSchema,
  PaginatedEnrollmentsSchema,
  PaginatedPeopleSchema,
} from "../../schemas/paginated.js";
import { Section as SectionSchema } from "../../schemas/section.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne } from "./request.js";

const BASE = "/v2/graph/sections";

export const listSections = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<Section, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, PaginatedSectionsSchema, pagination);

export const fetchSection = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  sectionId: string,
): Effect.Effect<Section, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, `${BASE}/${sectionId}`, SectionSchema);

export const listSectionEnrollments = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  sectionId: string,
  pagination: PaginationConfig,
): Stream.Stream<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${sectionId}/enrollments`, PaginatedEnrollmentsSchema, pagination);

export const listSectionPeople = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  sectionId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${sectionId}/people`, PaginatedPeopleSchema, pagination);

export const listSectionTeachers = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  sectionId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${sectionId}/teachers`, PaginatedPeopleSchema, pagination);

export const listSectionStudents = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  sectionId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${sectionId}/students`, PaginatedPeopleSchema, pagination);
