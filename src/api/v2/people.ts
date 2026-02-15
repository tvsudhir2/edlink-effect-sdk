import { Effect, Stream } from "effect";
import { HttpClient } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Person } from "../../schemas/person.js";
import type { Enrollment } from "../../schemas/enrollment.js";
import type { District } from "../../schemas/district.js";
import type { School } from "../../schemas/school.js";
import type { EdlinkClass } from "../../schemas/class.js";
import type { Section } from "../../schemas/section.js";
import type { Agent } from "../../schemas/agent.js";
import {
  PaginatedPeopleSchema,
  PaginatedEnrollmentsSchema,
  PaginatedDistrictsSchema,
  PaginatedSchoolsSchema,
  PaginatedClassesSchema,
  PaginatedSectionsSchema,
  PaginatedAgentsSchema,
} from "../../schemas/paginated.js";
import { Person as PersonSchema } from "../../schemas/person.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne } from "./request.js";

const BASE = "/v2/graph/people";

export const listPeople = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, PaginatedPeopleSchema, pagination);

export const fetchPerson = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
): Effect.Effect<Person, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, `${BASE}/${personId}`, PersonSchema);

export const listPersonEnrollments = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/enrollments`, PaginatedEnrollmentsSchema, pagination);

export const listPersonDistricts = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<District, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/districts`, PaginatedDistrictsSchema, pagination);

export const listPersonSchools = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<School, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/schools`, PaginatedSchoolsSchema, pagination);

export const listPersonClasses = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/classes`, PaginatedClassesSchema, pagination);

export const listPersonSections = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<Section, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/sections`, PaginatedSectionsSchema, pagination);

export const listPersonAgents = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<Agent, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/agents`, PaginatedAgentsSchema, pagination);
