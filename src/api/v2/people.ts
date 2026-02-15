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
import { Person as PersonSchema } from "../../schemas/person.js";
import { Enrollment as EnrollmentSchema } from "../../schemas/enrollment.js";
import { District as DistrictSchema } from "../../schemas/district.js";
import { School as SchoolSchema } from "../../schemas/school.js";
import { EdlinkClass as ClassSchema } from "../../schemas/class.js";
import { Section as SectionSchema } from "../../schemas/section.js";
import { Agent as AgentSchema } from "../../schemas/agent.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne } from "./request.js";

const BASE = "/v2/graph/people";

export const listPeople = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, PersonSchema, pagination);

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
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/enrollments`, EnrollmentSchema, pagination);

export const listPersonDistricts = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<District, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/districts`, DistrictSchema, pagination);

export const listPersonSchools = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<School, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/schools`, SchoolSchema, pagination);

export const listPersonClasses = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/classes`, ClassSchema, pagination);

export const listPersonSections = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<Section, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/sections`, SectionSchema, pagination);

export const listPersonAgents = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  personId: string,
  pagination: PaginationConfig,
): Stream.Stream<Agent, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${personId}/agents`, AgentSchema, pagination);
