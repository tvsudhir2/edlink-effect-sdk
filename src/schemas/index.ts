// ---------------------------------------------------------------------------
// Schemas barrel — re-exports all entity schemas and enums
// ---------------------------------------------------------------------------

export { Address } from "@/schemas/address.js";
export { Agent } from "@/schemas/agent.js";
export { Assignment } from "@/schemas/assignment.js";
export { Attachment } from "@/schemas/attachment.js";
export { Category } from "@/schemas/category.js";
export { EdlinkClass } from "@/schemas/class.js";
export {
  AgentRelationship,
  AssignmentAssigneeMode,
  AssignmentState,
  AttachmentType,
  ClassState,
  EnrollmentState,
  EventTarget,
  EventType,
  Gender,
  GradeLevel,
  Identifier,
  ProductState,
  Race,
  ResidenceStatus,
  Role,
  SectionState,
  SessionState,
  SessionType,
  Subject,
  SubmissionFlag,
  SubmissionState,
} from "@/schemas/common.js";
export { Course } from "@/schemas/course.js";
export { Demographics } from "@/schemas/demographics.js";
export { District } from "@/schemas/district.js";
export { Enrollment } from "@/schemas/enrollment.js";
export { EdlinkEvent, EdlinkEventSchema } from "@/schemas/event.js";
export { License } from "@/schemas/license.js";
export type {
  PaginatedAgentsResponse,
  PaginatedAssignmentsResponse,
  PaginatedCategoriesResponse,
  PaginatedClassesResponse,
  PaginatedCoursesResponse,
  PaginatedDistrictsResponse,
  PaginatedEnrollmentsResponse,
  PaginatedEventsResponse,
  PaginatedLicensesResponse,
  PaginatedPeopleResponse,
  PaginatedSchoolsResponse,
  PaginatedSectionsResponse,
  PaginatedSessionsResponse,
  PaginatedSubmissionsResponse,
} from "@/schemas/paginated.js";
export {
  PaginatedAgentsSchema,
  PaginatedAssignmentsSchema,
  PaginatedCategoriesSchema,
  PaginatedClassesSchema,
  PaginatedCoursesSchema,
  PaginatedDistrictsSchema,
  PaginatedEnrollmentsSchema,
  PaginatedEventsSchema,
  PaginatedLicensesSchema,
  PaginatedPeopleSchema,
  PaginatedResponseSchema,
  PaginatedSchoolsSchema,
  PaginatedSectionsSchema,
  PaginatedSessionsSchema,
  PaginatedSubmissionsSchema,
} from "@/schemas/paginated.js";
export { Person } from "@/schemas/person.js";
export { Product } from "@/schemas/product.js";
export { School } from "@/schemas/school.js";
export { Section } from "@/schemas/section.js";
export { Session } from "@/schemas/session.js";
export { Attempt, Submission } from "@/schemas/submission.js";
export { TokenData, TokenResponse, UserProfile } from "@/schemas/token.js";
