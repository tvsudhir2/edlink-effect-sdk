import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { Agent } from "@/schemas/agent.js";
import { Agent as AgentSchema } from "@/schemas/agent.js";
import type { EdlinkClass } from "@/schemas/class.js";
import { EdlinkClass as ClassSchema } from "@/schemas/class.js";
import type { District } from "@/schemas/district.js";
import { District as DistrictSchema } from "@/schemas/district.js";
import type { Enrollment } from "@/schemas/enrollment.js";
import { Enrollment as EnrollmentSchema } from "@/schemas/enrollment.js";
import type { Person } from "@/schemas/person.js";
import { Person as PersonSchema } from "@/schemas/person.js";
import type { School } from "@/schemas/school.js";
import { School as SchoolSchema } from "@/schemas/school.js";
import type { Section } from "@/schemas/section.js";
import { Section as SectionSchema } from "@/schemas/section.js";
import { fetchOne, type RequestContext } from "@/api/v2/request.js";
import { createPaginatedStream } from "@/api/v2/stream.js";

const BASE = "/v2/graph/people";

export interface ListPersonSubResourceOptions {
  readonly personId: string;
  readonly pagination: PaginationConfig;
}

export const listPeople = (
  pagination: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: BASE, schema: PersonSchema }, pagination, ctx);

export const fetchPerson = (
  personId: string,
  ctx: RequestContext,
): Effect.Effect<Person, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: `${BASE}/${personId}`, schema: PersonSchema }, ctx);

export const listPersonEnrollments = (
  options: ListPersonSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.personId}/enrollments`, schema: EnrollmentSchema },
    options.pagination,
    ctx,
  );

export const listPersonDistricts = (
  options: ListPersonSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<District, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.personId}/districts`, schema: DistrictSchema },
    options.pagination,
    ctx,
  );

export const listPersonSchools = (
  options: ListPersonSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<School, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.personId}/schools`, schema: SchoolSchema }, options.pagination, ctx);

export const listPersonClasses = (
  options: ListPersonSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<EdlinkClass, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.personId}/classes`, schema: ClassSchema }, options.pagination, ctx);

export const listPersonSections = (
  options: ListPersonSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Section, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.personId}/sections`, schema: SectionSchema },
    options.pagination,
    ctx,
  );

export const listPersonAgents = (
  options: ListPersonSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Agent, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.personId}/agents`, schema: AgentSchema }, options.pagination, ctx);
