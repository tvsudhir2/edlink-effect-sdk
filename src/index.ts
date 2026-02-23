// ---------------------------------------------------------------------------
// edlink-effect-sdk — public API
// ---------------------------------------------------------------------------

export type { AuthorizationUrlOptions, UserRequestContext } from "./api/v2/oauth.js";
// API helpers — request context types
export type { EndpointOptions, RequestContext } from "./api/v2/request.js";
export type {
  AgentsServiceType,
  AssignmentsServiceType,
  CategoriesServiceType,
  ClassesServiceType,
  CoursesServiceType,
  DistrictsServiceType,
  EnrollmentsServiceType,
  EventsServiceType,
  LicensesServiceType,
  PeopleServiceType,
  SchoolsServiceType,
  SectionsServiceType,
  SessionsServiceType,
  SubmissionsServiceType,
} from "./client.js";
// Client service & layer — aggregate facade + individual sub-service classes
export {
  AgentsService,
  AssignmentsService,
  CategoriesService,
  ClassesService,
  CoursesService,
  DistrictsService,
  EdlinkClient,
  EdlinkClientLive,
  EnrollmentsService,
  EventsService,
  LicensesService,
  PeopleService,
  SchoolsService,
  SectionsService,
  SessionsService,
  SubmissionsService,
} from "./client.js";
export type { EdlinkConfigData, EdlinkUserConfigData } from "./config.js";
export { EdlinkConfig, EdlinkUserConfig } from "./config.js";
// Errors
export { EdlinkApiError, EdlinkDecodeError } from "./errors.js";
export { EdlinkLive, EdlinkUserLive } from "./layers.js";
// Pagination
export type {
  PageResultOptions,
  PaginateAll,
  PaginateByPages,
  PaginateByRecords,
  PaginationConfig,
  PaginationState,
} from "./pagination.js";
export { deriveNextUrl, shouldContinue, trimItems } from "./pagination.js";
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
} from "./schemas/index.js";
// All schemas & types
export {
  Address,
  Agent,
  AgentRelationship,
  Assignment,
  AssignmentAssigneeMode,
  AssignmentState,
  Attachment,
  AttachmentType,
  Attempt,
  Category,
  ClassState,
  Course,
  Demographics,
  District,
  EdlinkClass,
  EdlinkEvent,
  EdlinkEventSchema,
  Enrollment,
  EnrollmentState,
  EventTarget,
  EventType,
  Gender,
  GradeLevel,
  // Value objects
  Identifier,
  License,
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
  // Paginated schemas
  PaginatedResponseSchema,
  PaginatedSchoolsSchema,
  PaginatedSectionsSchema,
  PaginatedSessionsSchema,
  PaginatedSubmissionsSchema,
  Person,
  // Entities
  Product,
  ProductState,
  Race,
  ResidenceStatus,
  Role,
  School,
  Section,
  SectionState,
  Session,
  SessionState,
  SessionType,
  // Enums
  Subject,
  Submission,
  SubmissionFlag,
  SubmissionState,
  TokenData,
  // Token / User API
  TokenResponse,
  UserProfile,
} from "./schemas/index.js";
export type { TokenStoreShape } from "./token-store.js";
export { InMemoryTokenStoreLive, TokenStore } from "./token-store.js";
export { EdlinkUserClient, EdlinkUserClientLive } from "./user-client.js";
