import { Effect, Layer, ServiceMap, type Stream } from "effect";
import { HttpClient } from "effect/unstable/http";

import * as AgentsApi from "@/api/v2/agents.js";
import * as AssignmentsApi from "@/api/v2/assignments.js";
import * as CategoriesApi from "@/api/v2/categories.js";
import * as ClassesApi from "@/api/v2/classes.js";
import * as CoursesApi from "@/api/v2/courses.js";
import * as DistrictsApi from "@/api/v2/districts.js";
import * as EnrollmentsApi from "@/api/v2/enrollments.js";
import * as EventsApi from "@/api/v2/events.js";
import * as LicensesApi from "@/api/v2/licenses.js";
import * as PeopleApi from "@/api/v2/people.js";
import type { RequestContext } from "@/api/v2/request.js";
import * as SchoolsApi from "@/api/v2/schools.js";
import * as SectionsApi from "@/api/v2/sections.js";
import * as SessionsApi from "@/api/v2/sessions.js";
import * as SubmissionsApi from "@/api/v2/submissions.js";
import { EdlinkConfig } from "@/config.js";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { Agent } from "@/schemas/agent.js";
import type { Assignment } from "@/schemas/assignment.js";
import type { Category } from "@/schemas/category.js";
import type { EdlinkClass } from "@/schemas/class.js";
import type { Course } from "@/schemas/course.js";
import type { District } from "@/schemas/district.js";
import type { Enrollment } from "@/schemas/enrollment.js";
import type { EdlinkEvent } from "@/schemas/event.js";
import type { License } from "@/schemas/license.js";
import type { Person } from "@/schemas/person.js";
import type { School } from "@/schemas/school.js";
import type { Section } from "@/schemas/section.js";
import type { Session } from "@/schemas/session.js";
import type { Submission } from "@/schemas/submission.js";

// ---------------------------------------------------------------------------
// Error union shorthand
// ---------------------------------------------------------------------------

type ApiErrors = EdlinkApiError | EdlinkDecodeError;

// ---------------------------------------------------------------------------
// Shared context builder — reused by every sub-service Live layer
// ---------------------------------------------------------------------------

const makeCtx = Effect.gen(function* () {
  const edlinkConfig = yield* EdlinkConfig;
  const httpClient = yield* HttpClient.HttpClient;
  const ctx: RequestContext = { config: edlinkConfig, httpClient };
  const defaultPagination: PaginationConfig = { type: "pages", maxPages: edlinkConfig.defaultMaxPages };
  const pg = (p?: PaginationConfig): PaginationConfig => p ?? defaultPagination;
  return { ctx, pg } as const;
});

// ---------------------------------------------------------------------------
// Service value types — exported so callers can annotate variables/params
// ---------------------------------------------------------------------------

export type EventsServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<EdlinkEvent, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<EdlinkEvent, ApiErrors>;
};

export type DistrictsServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<District, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<District, ApiErrors>;
  readonly listAdministrators: (districtId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
};

export type SchoolsServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<School, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<School, ApiErrors>;
  readonly listClasses: (schoolId: string, config?: PaginationConfig) => Stream.Stream<EdlinkClass, ApiErrors>;
  readonly listCourses: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Course, ApiErrors>;
  readonly listSessions: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Session, ApiErrors>;
  readonly listPeople: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listAdministrators: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listTeachers: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listStudents: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
};

export type CoursesServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Course, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Course, ApiErrors>;
  readonly listClasses: (courseId: string, config?: PaginationConfig) => Stream.Stream<EdlinkClass, ApiErrors>;
};

export type SessionsServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Session, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Session, ApiErrors>;
};

export type SectionsServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Section, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Section, ApiErrors>;
  readonly listEnrollments: (sectionId: string, config?: PaginationConfig) => Stream.Stream<Enrollment, ApiErrors>;
  readonly listPeople: (sectionId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listTeachers: (sectionId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listStudents: (sectionId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
};

export type ClassesServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<EdlinkClass, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<EdlinkClass, ApiErrors>;
  readonly listSections: (classId: string, config?: PaginationConfig) => Stream.Stream<Section, ApiErrors>;
  readonly listEnrollments: (classId: string, config?: PaginationConfig) => Stream.Stream<Enrollment, ApiErrors>;
  readonly listPeople: (classId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listTeachers: (classId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listStudents: (classId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
};

export type PeopleServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Person, ApiErrors>;
  readonly listEnrollments: (personId: string, config?: PaginationConfig) => Stream.Stream<Enrollment, ApiErrors>;
  readonly listDistricts: (personId: string, config?: PaginationConfig) => Stream.Stream<District, ApiErrors>;
  readonly listSchools: (personId: string, config?: PaginationConfig) => Stream.Stream<School, ApiErrors>;
  readonly listClasses: (personId: string, config?: PaginationConfig) => Stream.Stream<EdlinkClass, ApiErrors>;
  readonly listSections: (personId: string, config?: PaginationConfig) => Stream.Stream<Section, ApiErrors>;
  readonly listAgents: (personId: string, config?: PaginationConfig) => Stream.Stream<Agent, ApiErrors>;
};

export type EnrollmentsServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Enrollment, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Enrollment, ApiErrors>;
};

export type AgentsServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Agent, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Agent, ApiErrors>;
};

export type LicensesServiceType = {
  readonly list: (config?: PaginationConfig) => Stream.Stream<License, ApiErrors>;
};

export type AssignmentsServiceType = {
  readonly list: (classId: string, config?: PaginationConfig) => Stream.Stream<Assignment, ApiErrors>;
  readonly fetch: (classId: string, assignmentId: string) => Effect.Effect<Assignment, ApiErrors>;
  readonly create: (classId: string, body: Record<string, unknown>) => Effect.Effect<Assignment, ApiErrors>;
  readonly update: (options: AssignmentsApi.UpdateAssignmentOptions) => Effect.Effect<Assignment, ApiErrors>;
  readonly delete: (classId: string, assignmentId: string) => Effect.Effect<void, EdlinkApiError>;
};

export type CategoriesServiceType = {
  readonly list: (classId: string, config?: PaginationConfig) => Stream.Stream<Category, ApiErrors>;
  readonly fetch: (classId: string, categoryId: string) => Effect.Effect<Category, ApiErrors>;
  readonly create: (classId: string, body: Record<string, unknown>) => Effect.Effect<Category, ApiErrors>;
  readonly update: (options: CategoriesApi.UpdateCategoryOptions) => Effect.Effect<Category, ApiErrors>;
  readonly delete: (classId: string, categoryId: string) => Effect.Effect<void, EdlinkApiError>;
};

export type SubmissionsServiceType = {
  readonly list: (
    classId: string,
    assignmentId: string,
    config?: PaginationConfig,
  ) => Stream.Stream<Submission, ApiErrors>;
  readonly fetch: (options: SubmissionsApi.FetchSubmissionOptions) => Effect.Effect<Submission, ApiErrors>;
  readonly submit: (options: SubmissionsApi.SubmitAttemptOptions) => Effect.Effect<Submission, ApiErrors>;
  readonly reclaim: (classId: string, assignmentId: string) => Effect.Effect<Submission, ApiErrors>;
  readonly return: (options: SubmissionsApi.ReturnSubmissionOptions) => Effect.Effect<Submission, ApiErrors>;
  readonly update: (options: SubmissionsApi.UpdateSubmissionOptions) => Effect.Effect<Submission, ApiErrors>;
};

// ---------------------------------------------------------------------------
// Sub-service classes — each is an independently injectable Effect service
// ---------------------------------------------------------------------------

/**
 * Edlink Events sub-service.
 * Yields directly: `const events = yield* EventsService`
 */
export class EventsService extends ServiceMap.Service<EventsService, EventsServiceType>()("EdlinkEventsService") {
  static readonly Live: Layer.Layer<EventsService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    EventsService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => EventsApi.listEvents({ pagination: pg(p) }, ctx),
        fetch: (id) => EventsApi.fetchEvent({ eventId: id }, ctx),
      };
    }),
  );
}

/**
 * Edlink Districts sub-service.
 * Yields directly: `const districts = yield* DistrictsService`
 */
export class DistrictsService extends ServiceMap.Service<DistrictsService, DistrictsServiceType>()(
  "EdlinkDistrictsService",
) {
  static readonly Live: Layer.Layer<DistrictsService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    DistrictsService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => DistrictsApi.listDistricts(pg(p), ctx),
        fetch: (id) => DistrictsApi.fetchDistrict(id, ctx),
        listAdministrators: (districtId, p?) =>
          DistrictsApi.listDistrictAdministrators({ districtId, pagination: pg(p) }, ctx),
      };
    }),
  );
}

/**
 * Edlink Schools sub-service.
 * Yields directly: `const schools = yield* SchoolsService`
 */
export class SchoolsService extends ServiceMap.Service<SchoolsService, SchoolsServiceType>()("EdlinkSchoolsService") {
  static readonly Live: Layer.Layer<SchoolsService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    SchoolsService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => SchoolsApi.listSchools(pg(p), ctx),
        fetch: (id) => SchoolsApi.fetchSchool(id, ctx),
        listClasses: (schoolId, p?) => SchoolsApi.listSchoolClasses({ schoolId, pagination: pg(p) }, ctx),
        listCourses: (schoolId, p?) => SchoolsApi.listSchoolCourses({ schoolId, pagination: pg(p) }, ctx),
        listSessions: (schoolId, p?) => SchoolsApi.listSchoolSessions({ schoolId, pagination: pg(p) }, ctx),
        listPeople: (schoolId, p?) => SchoolsApi.listSchoolPeople({ schoolId, pagination: pg(p) }, ctx),
        listAdministrators: (schoolId, p?) => SchoolsApi.listSchoolAdministrators({ schoolId, pagination: pg(p) }, ctx),
        listTeachers: (schoolId, p?) => SchoolsApi.listSchoolTeachers({ schoolId, pagination: pg(p) }, ctx),
        listStudents: (schoolId, p?) => SchoolsApi.listSchoolStudents({ schoolId, pagination: pg(p) }, ctx),
      };
    }),
  );
}

/**
 * Edlink Courses sub-service.
 * Yields directly: `const courses = yield* CoursesService`
 */
export class CoursesService extends ServiceMap.Service<CoursesService, CoursesServiceType>()("EdlinkCoursesService") {
  static readonly Live: Layer.Layer<CoursesService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    CoursesService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => CoursesApi.listCourses(pg(p), ctx),
        fetch: (id) => CoursesApi.fetchCourse(id, ctx),
        listClasses: (courseId, p?) => CoursesApi.listCourseClasses({ courseId, pagination: pg(p) }, ctx),
      };
    }),
  );
}

/**
 * Edlink Sessions sub-service.
 * Yields directly: `const sessions = yield* SessionsService`
 */
export class SessionsService extends ServiceMap.Service<SessionsService, SessionsServiceType>()(
  "EdlinkSessionsService",
) {
  static readonly Live: Layer.Layer<SessionsService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    SessionsService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => SessionsApi.listSessions(pg(p), ctx),
        fetch: (id) => SessionsApi.fetchSession(id, ctx),
      };
    }),
  );
}

/**
 * Edlink Sections sub-service.
 * Yields directly: `const sections = yield* SectionsService`
 */
export class SectionsService extends ServiceMap.Service<SectionsService, SectionsServiceType>()(
  "EdlinkSectionsService",
) {
  static readonly Live: Layer.Layer<SectionsService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    SectionsService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => SectionsApi.listSections(pg(p), ctx),
        fetch: (id) => SectionsApi.fetchSection(id, ctx),
        listEnrollments: (sectionId, p?) => SectionsApi.listSectionEnrollments({ sectionId, pagination: pg(p) }, ctx),
        listPeople: (sectionId, p?) => SectionsApi.listSectionPeople({ sectionId, pagination: pg(p) }, ctx),
        listTeachers: (sectionId, p?) => SectionsApi.listSectionTeachers({ sectionId, pagination: pg(p) }, ctx),
        listStudents: (sectionId, p?) => SectionsApi.listSectionStudents({ sectionId, pagination: pg(p) }, ctx),
      };
    }),
  );
}

/**
 * Edlink Classes sub-service.
 * Yields directly: `const classes = yield* ClassesService`
 */
export class ClassesService extends ServiceMap.Service<ClassesService, ClassesServiceType>()("EdlinkClassesService") {
  static readonly Live: Layer.Layer<ClassesService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    ClassesService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => ClassesApi.listClasses(pg(p), ctx),
        fetch: (id) => ClassesApi.fetchClass(id, ctx),
        listSections: (classId, p?) => ClassesApi.listClassSections({ classId, pagination: pg(p) }, ctx),
        listEnrollments: (classId, p?) => ClassesApi.listClassEnrollments({ classId, pagination: pg(p) }, ctx),
        listPeople: (classId, p?) => ClassesApi.listClassPeople({ classId, pagination: pg(p) }, ctx),
        listTeachers: (classId, p?) => ClassesApi.listClassTeachers({ classId, pagination: pg(p) }, ctx),
        listStudents: (classId, p?) => ClassesApi.listClassStudents({ classId, pagination: pg(p) }, ctx),
      };
    }),
  );
}

/**
 * Edlink People sub-service.
 * Yields directly: `const people = yield* PeopleService`
 */
export class PeopleService extends ServiceMap.Service<PeopleService, PeopleServiceType>()("EdlinkPeopleService") {
  static readonly Live: Layer.Layer<PeopleService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    PeopleService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => PeopleApi.listPeople(pg(p), ctx),
        fetch: (id) => PeopleApi.fetchPerson(id, ctx),
        listEnrollments: (personId, p?) => PeopleApi.listPersonEnrollments({ personId, pagination: pg(p) }, ctx),
        listDistricts: (personId, p?) => PeopleApi.listPersonDistricts({ personId, pagination: pg(p) }, ctx),
        listSchools: (personId, p?) => PeopleApi.listPersonSchools({ personId, pagination: pg(p) }, ctx),
        listClasses: (personId, p?) => PeopleApi.listPersonClasses({ personId, pagination: pg(p) }, ctx),
        listSections: (personId, p?) => PeopleApi.listPersonSections({ personId, pagination: pg(p) }, ctx),
        listAgents: (personId, p?) => PeopleApi.listPersonAgents({ personId, pagination: pg(p) }, ctx),
      };
    }),
  );
}

/**
 * Edlink Enrollments sub-service.
 * Yields directly: `const enrollments = yield* EnrollmentsService`
 */
export class EnrollmentsService extends ServiceMap.Service<EnrollmentsService, EnrollmentsServiceType>()(
  "EdlinkEnrollmentsService",
) {
  static readonly Live: Layer.Layer<EnrollmentsService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    EnrollmentsService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => EnrollmentsApi.listEnrollments(pg(p), ctx),
        fetch: (id) => EnrollmentsApi.fetchEnrollment(id, ctx),
      };
    }),
  );
}

/**
 * Edlink Agents sub-service.
 * Yields directly: `const agents = yield* AgentsService`
 */
export class AgentsService extends ServiceMap.Service<AgentsService, AgentsServiceType>()("EdlinkAgentsService") {
  static readonly Live: Layer.Layer<AgentsService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    AgentsService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => AgentsApi.listAgents(pg(p), ctx),
        fetch: (id) => AgentsApi.fetchAgent(id, ctx),
      };
    }),
  );
}

/**
 * Edlink Licenses sub-service.
 * Yields directly: `const licenses = yield* LicensesService`
 */
export class LicensesService extends ServiceMap.Service<LicensesService, LicensesServiceType>()(
  "EdlinkLicensesService",
) {
  static readonly Live: Layer.Layer<LicensesService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    LicensesService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (p?) => LicensesApi.listLicenses(pg(p), ctx),
      };
    }),
  );
}

/**
 * Edlink Assignments sub-service.
 * Yields directly: `const assignments = yield* AssignmentsService`
 */
export class AssignmentsService extends ServiceMap.Service<AssignmentsService, AssignmentsServiceType>()(
  "EdlinkAssignmentsService",
) {
  static readonly Live: Layer.Layer<AssignmentsService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    AssignmentsService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (classId, p?) => AssignmentsApi.listAssignments({ classId, pagination: pg(p) }, ctx),
        fetch: (classId, assignmentId) => AssignmentsApi.fetchAssignment({ classId, assignmentId }, ctx),
        create: (classId, body) => AssignmentsApi.createAssignment({ classId, body }, ctx),
        update: (options) => AssignmentsApi.updateAssignment(options, ctx),
        delete: (classId, assignmentId) => AssignmentsApi.deleteAssignment({ classId, assignmentId }, ctx),
      };
    }),
  );
}

/**
 * Edlink Categories sub-service.
 * Yields directly: `const categories = yield* CategoriesService`
 */
export class CategoriesService extends ServiceMap.Service<CategoriesService, CategoriesServiceType>()(
  "EdlinkCategoriesService",
) {
  static readonly Live: Layer.Layer<CategoriesService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    CategoriesService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (classId, p?) => CategoriesApi.listCategories({ classId, pagination: pg(p) }, ctx),
        fetch: (classId, categoryId) => CategoriesApi.fetchCategory({ classId, categoryId }, ctx),
        create: (classId, body) => CategoriesApi.createCategory({ classId, body }, ctx),
        update: (options) => CategoriesApi.updateCategory(options, ctx),
        delete: (classId, categoryId) => CategoriesApi.deleteCategory({ classId, categoryId }, ctx),
      };
    }),
  );
}

/**
 * Edlink Submissions sub-service.
 * Yields directly: `const submissions = yield* SubmissionsService`
 */
export class SubmissionsService extends ServiceMap.Service<SubmissionsService, SubmissionsServiceType>()(
  "EdlinkSubmissionsService",
) {
  static readonly Live: Layer.Layer<SubmissionsService, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
    SubmissionsService,
    Effect.gen(function* () {
      const { ctx, pg } = yield* makeCtx;
      return {
        list: (classId, assignmentId, p?) =>
          SubmissionsApi.listSubmissions({ classId, assignmentId, pagination: pg(p) }, ctx),
        fetch: (options) => SubmissionsApi.fetchSubmission(options, ctx),
        submit: (options) => SubmissionsApi.submitAttempt(options, ctx),
        reclaim: (classId, assignmentId) => SubmissionsApi.reclaimSubmission({ classId, assignmentId }, ctx),
        return: (options) => SubmissionsApi.returnSubmission(options, ctx),
        update: (options) => SubmissionsApi.updateSubmission(options, ctx),
      };
    }),
  );
}

// ---------------------------------------------------------------------------
// Aggregate client — provides all sub-services under a single tag
// ---------------------------------------------------------------------------

/** All sub-service Live layers merged — shared by EdlinkClientLive */
const AllSubServiceLives = Layer.mergeAll(
  EventsService.Live,
  DistrictsService.Live,
  SchoolsService.Live,
  CoursesService.Live,
  SessionsService.Live,
  SectionsService.Live,
  ClassesService.Live,
  PeopleService.Live,
  EnrollmentsService.Live,
  AgentsService.Live,
  LicensesService.Live,
  AssignmentsService.Live,
  CategoriesService.Live,
  SubmissionsService.Live,
);

/**
 * Edlink API Client — full Graph API coverage.
 *
 * **Preferred usage** — yield individual sub-services directly:
 * ```ts
 * const districts = yield* DistrictsService
 * const classes   = yield* ClassesService
 * ```
 *
 * **Legacy usage** — aggregate facade still supported:
 * ```ts
 * const client = yield* EdlinkClient
 * client.districts.list()
 * ```
 */
export class EdlinkClient extends ServiceMap.Service<
  EdlinkClient,
  {
    readonly events: EventsServiceType;
    readonly districts: DistrictsServiceType;
    readonly schools: SchoolsServiceType;
    readonly courses: CoursesServiceType;
    readonly sessions: SessionsServiceType;
    readonly sections: SectionsServiceType;
    readonly classes: ClassesServiceType;
    readonly people: PeopleServiceType;
    readonly enrollments: EnrollmentsServiceType;
    readonly agents: AgentsServiceType;
    readonly licenses: LicensesServiceType;
    readonly assignments: AssignmentsServiceType;
    readonly categories: CategoriesServiceType;
    readonly submissions: SubmissionsServiceType;
  }
>()("EdlinkClient") {}

// ---------------------------------------------------------------------------
// Construction & layer
// ---------------------------------------------------------------------------

const makeEdlinkClient = Effect.gen(function* () {
  const events = yield* EventsService;
  const districts = yield* DistrictsService;
  const schools = yield* SchoolsService;
  const courses = yield* CoursesService;
  const sessions = yield* SessionsService;
  const sections = yield* SectionsService;
  const classes = yield* ClassesService;
  const people = yield* PeopleService;
  const enrollments = yield* EnrollmentsService;
  const agents = yield* AgentsService;
  const licenses = yield* LicensesService;
  const assignments = yield* AssignmentsService;
  const categories = yield* CategoriesService;
  const submissions = yield* SubmissionsService;

  return {
    events,
    districts,
    schools,
    courses,
    sessions,
    sections,
    classes,
    people,
    enrollments,
    agents,
    licenses,
    assignments,
    categories,
    submissions,
  };
});

/**
 * Live layer — provides `EdlinkClient` (aggregate facade) **and** all 14
 * individual sub-service classes. Requires `EdlinkConfig` + `HttpClient`.
 */
export const EdlinkClientLive: Layer.Layer<
  | EdlinkClient
  | EventsService
  | DistrictsService
  | SchoolsService
  | CoursesService
  | SessionsService
  | SectionsService
  | ClassesService
  | PeopleService
  | EnrollmentsService
  | AgentsService
  | LicensesService
  | AssignmentsService
  | CategoriesService
  | SubmissionsService,
  never,
  EdlinkConfig | HttpClient.HttpClient
> = Layer.effect(EdlinkClient, makeEdlinkClient).pipe(Layer.provideMerge(AllSubServiceLives));
