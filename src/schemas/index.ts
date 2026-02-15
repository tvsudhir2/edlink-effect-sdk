// ---------------------------------------------------------------------------
// Schemas barrel — re-exports all entity schemas and enums
// ---------------------------------------------------------------------------

export {
  Subject,
  GradeLevel,
  Role,
  Gender,
  Race,
  ResidenceStatus,
  EventType,
  EventTarget,
  ClassState,
  EnrollmentState,
  SessionType,
  SessionState,
  SectionState,
  AgentRelationship,
  AssignmentState,
  AssignmentAssigneeMode,
  SubmissionState,
  SubmissionFlag,
  AttachmentType,
  ProductState,
  Identifier,
} from "./common.js";

export { Address } from "./address.js";
export { Demographics } from "./demographics.js";
export { Product } from "./product.js";
export { License } from "./license.js";
export { Attachment } from "./attachment.js";
export { District } from "./district.js";
export { School } from "./school.js";
export { Course } from "./course.js";
export { Session } from "./session.js";
export { Section } from "./section.js";
export { EdlinkClass } from "./class.js";
export { Enrollment } from "./enrollment.js";
export { Person } from "./person.js";
export { Agent } from "./agent.js";
export { Assignment } from "./assignment.js";
export { Category } from "./category.js";
export { Attempt, Submission } from "./submission.js";
export { EdlinkEvent, EdlinkEventSchema } from "./event.js";
export { TokenResponse, TokenData, UserProfile } from "./token.js";

export {
  PaginatedResponseSchema,
  PaginatedEventsSchema,
  PaginatedPeopleSchema,
  PaginatedSchoolsSchema,
  PaginatedDistrictsSchema,
  PaginatedCoursesSchema,
  PaginatedClassesSchema,
  PaginatedSectionsSchema,
  PaginatedSessionsSchema,
  PaginatedEnrollmentsSchema,
  PaginatedAgentsSchema,
  PaginatedAssignmentsSchema,
  PaginatedCategoriesSchema,
  PaginatedSubmissionsSchema,
  PaginatedLicensesSchema,
} from "./paginated.js";

export type {
  PaginatedEventsResponse,
  PaginatedPeopleResponse,
  PaginatedSchoolsResponse,
  PaginatedDistrictsResponse,
  PaginatedCoursesResponse,
  PaginatedClassesResponse,
  PaginatedSectionsResponse,
  PaginatedSessionsResponse,
  PaginatedEnrollmentsResponse,
  PaginatedAgentsResponse,
  PaginatedAssignmentsResponse,
  PaginatedCategoriesResponse,
  PaginatedSubmissionsResponse,
  PaginatedLicensesResponse,
} from "./paginated.js";
