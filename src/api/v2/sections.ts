import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { Enrollment } from "@/schemas/enrollment.js";
import { Enrollment as EnrollmentSchema } from "@/schemas/enrollment.js";
import type { Person } from "@/schemas/person.js";
import { Person as PersonSchema } from "@/schemas/person.js";
import type { Section } from "@/schemas/section.js";
import { Section as SectionSchema } from "@/schemas/section.js";
import { fetchOne, type RequestContext } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const BASE = "/v2/graph/sections";

export interface ListSectionSubResourceOptions {
  readonly sectionId: string;
  readonly pagination: PaginationConfig;
}

export const listSections = (
  pagination: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<Section, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: BASE, schema: SectionSchema }, pagination, ctx);

export const fetchSection = (
  sectionId: string,
  ctx: RequestContext,
): Effect.Effect<Section, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: `${BASE}/${sectionId}`, schema: SectionSchema }, ctx);

export const listSectionEnrollments = (
  options: ListSectionSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Enrollment, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.sectionId}/enrollments`, schema: EnrollmentSchema },
    options.pagination,
    ctx,
  );

export const listSectionPeople = (
  options: ListSectionSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: `${BASE}/${options.sectionId}/people`, schema: PersonSchema }, options.pagination, ctx);

export const listSectionTeachers = (
  options: ListSectionSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.sectionId}/teachers`, schema: PersonSchema },
    options.pagination,
    ctx,
  );

export const listSectionStudents = (
  options: ListSectionSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.sectionId}/students`, schema: PersonSchema },
    options.pagination,
    ctx,
  );
