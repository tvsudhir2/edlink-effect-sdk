import { Schema } from "effect";

import { Agent } from "@/schemas/agent.js";
import { Assignment } from "@/schemas/assignment.js";
import { Category } from "@/schemas/category.js";
import { EdlinkClass } from "@/schemas/class.js";
import { Course } from "@/schemas/course.js";
import { District } from "@/schemas/district.js";
import { Enrollment } from "@/schemas/enrollment.js";
import { EdlinkEvent } from "@/schemas/event.js";
import { License } from "@/schemas/license.js";
import { Person } from "@/schemas/person.js";
import { School } from "@/schemas/school.js";
import { Section } from "@/schemas/section.js";
import { Session } from "@/schemas/session.js";
import { Submission } from "@/schemas/submission.js";

// ---------------------------------------------------------------------------
// Paginated response — generic schema factory
// ---------------------------------------------------------------------------

/**
 * Build a paginated-response schema for any item type.
 * Edlink returns `{ $data: T[], $next: string | null }`.
 */
export const PaginatedResponseSchema = <A>(itemSchema: Schema.Decoder<A>) =>
  Schema.Struct({
    $data: Schema.Array(itemSchema),
    $next: Schema.optional(Schema.NullOr(Schema.String)),
  });

// ---------------------------------------------------------------------------
// Pre-built paginated schemas for each entity
// ---------------------------------------------------------------------------

export const PaginatedEventsSchema = PaginatedResponseSchema(EdlinkEvent);
export type PaginatedEventsResponse = typeof PaginatedEventsSchema.Type;

export const PaginatedPeopleSchema = PaginatedResponseSchema(Person);
export type PaginatedPeopleResponse = typeof PaginatedPeopleSchema.Type;

export const PaginatedSchoolsSchema = PaginatedResponseSchema(School);
export type PaginatedSchoolsResponse = typeof PaginatedSchoolsSchema.Type;

export const PaginatedDistrictsSchema = PaginatedResponseSchema(District);
export type PaginatedDistrictsResponse = typeof PaginatedDistrictsSchema.Type;

export const PaginatedCoursesSchema = PaginatedResponseSchema(Course);
export type PaginatedCoursesResponse = typeof PaginatedCoursesSchema.Type;

export const PaginatedClassesSchema = PaginatedResponseSchema(EdlinkClass);
export type PaginatedClassesResponse = typeof PaginatedClassesSchema.Type;

export const PaginatedSectionsSchema = PaginatedResponseSchema(Section);
export type PaginatedSectionsResponse = typeof PaginatedSectionsSchema.Type;

export const PaginatedSessionsSchema = PaginatedResponseSchema(Session);
export type PaginatedSessionsResponse = typeof PaginatedSessionsSchema.Type;

export const PaginatedEnrollmentsSchema = PaginatedResponseSchema(Enrollment);
export type PaginatedEnrollmentsResponse = typeof PaginatedEnrollmentsSchema.Type;

export const PaginatedAgentsSchema = PaginatedResponseSchema(Agent);
export type PaginatedAgentsResponse = typeof PaginatedAgentsSchema.Type;

export const PaginatedAssignmentsSchema = PaginatedResponseSchema(Assignment);
export type PaginatedAssignmentsResponse = typeof PaginatedAssignmentsSchema.Type;

export const PaginatedCategoriesSchema = PaginatedResponseSchema(Category);
export type PaginatedCategoriesResponse = typeof PaginatedCategoriesSchema.Type;

export const PaginatedSubmissionsSchema = PaginatedResponseSchema(Submission);
export type PaginatedSubmissionsResponse = typeof PaginatedSubmissionsSchema.Type;

export const PaginatedLicensesSchema = PaginatedResponseSchema(License);
export type PaginatedLicensesResponse = typeof PaginatedLicensesSchema.Type;
