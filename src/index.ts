// ---------------------------------------------------------------------------
// edlink-effect-sdk — public API
// ---------------------------------------------------------------------------

// Client service & layer
export { EdlinkClient, EdlinkClientLive } from "./client.js";
export { EdlinkConfig } from "./config.js";
export type { EdlinkConfigData } from "./config.js";
export { EdlinkLive } from "./layers.js";

// Errors
export { EdlinkApiError, EdlinkDecodeError } from "./errors.js";

// Pagination
export type {
  PaginationConfig,
  PaginateByPages,
  PaginateByRecords,
  PaginateAll,
  PaginationState,
} from "./pagination.js";
export { shouldContinue, trimItems, deriveNextUrl } from "./pagination.js";

// All schemas & types
export {
  // Enums
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
  // Value objects
  Identifier,
  Address,
  Demographics,
  // Entities
  Product,
  License,
  Attachment,
  District,
  School,
  Course,
  Session,
  Section,
  EdlinkClass,
  Enrollment,
  Person,
  Agent,
  Assignment,
  Category,
  Attempt,
  Submission,
  EdlinkEvent,
  EdlinkEventSchema,
  // Paginated schemas
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
} from "./schemas/index.js";

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
} from "./schemas/index.js";
