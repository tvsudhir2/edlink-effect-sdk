import { Schema } from "effect";
import { Agent } from "./agent.js";
import { Assignment } from "./assignment.js";
import { Category } from "./category.js";
import { EdlinkClass } from "./class.js";
import { Course } from "./course.js";
import { District } from "./district.js";
import { Enrollment } from "./enrollment.js";
import { EdlinkEvent } from "./event.js";
import { License } from "./license.js";
import { Person } from "./person.js";
import { School } from "./school.js";
import { Section } from "./section.js";
import { Session } from "./session.js";
import { Submission } from "./submission.js";

// ---------------------------------------------------------------------------
// Paginated response — generic schema factory
// ---------------------------------------------------------------------------

/**
 * Build a paginated-response schema for any item type.
 * Edlink returns `{ $data: T[], $next: string | null }`.
 */
export const PaginatedResponseSchema = <A, I, R>(itemSchema: Schema.Schema<A, I, R>) =>
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
