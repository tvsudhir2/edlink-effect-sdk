import { HttpClient } from "@effect/platform";
import { Context, Effect, Layer, type Stream } from "effect";
import * as AgentsApi from "./api/v2/agents.js";
import * as AssignmentsApi from "./api/v2/assignments.js";
import * as CategoriesApi from "./api/v2/categories.js";
import * as ClassesApi from "./api/v2/classes.js";
import * as CoursesApi from "./api/v2/courses.js";
import * as DistrictsApi from "./api/v2/districts.js";
import * as EnrollmentsApi from "./api/v2/enrollments.js";
import * as EventsApi from "./api/v2/events.js";
import * as LicensesApi from "./api/v2/licenses.js";
import * as PeopleApi from "./api/v2/people.js";
import type { RequestContext } from "./api/v2/request.js";
import * as SchoolsApi from "./api/v2/schools.js";
import * as SectionsApi from "./api/v2/sections.js";
import * as SessionsApi from "./api/v2/sessions.js";
import * as SubmissionsApi from "./api/v2/submissions.js";
import { EdlinkConfig } from "./config.js";
import type { EdlinkApiError, EdlinkDecodeError } from "./errors.js";
import type { PaginationConfig } from "./pagination.js";
import type { Agent } from "./schemas/agent.js";
import type { Assignment } from "./schemas/assignment.js";
import type { Category } from "./schemas/category.js";
import type { EdlinkClass } from "./schemas/class.js";
import type { Course } from "./schemas/course.js";
import type { District } from "./schemas/district.js";
import type { Enrollment } from "./schemas/enrollment.js";
import type { EdlinkEvent } from "./schemas/event.js";
import type { License } from "./schemas/license.js";
import type { Person } from "./schemas/person.js";
import type { School } from "./schemas/school.js";
import type { Section } from "./schemas/section.js";
import type { Session } from "./schemas/session.js";
import type { Submission } from "./schemas/submission.js";

// ---------------------------------------------------------------------------
// Error union shorthand
// ---------------------------------------------------------------------------

type ApiErrors = EdlinkApiError | EdlinkDecodeError;

// ---------------------------------------------------------------------------
// Sub-service interfaces — grouped by entity
// ---------------------------------------------------------------------------

interface DistrictsService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<District, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<District, ApiErrors>;
  readonly listAdministrators: (districtId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
}

interface SchoolsService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<School, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<School, ApiErrors>;
  readonly listClasses: (schoolId: string, config?: PaginationConfig) => Stream.Stream<EdlinkClass, ApiErrors>;
  readonly listCourses: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Course, ApiErrors>;
  readonly listSessions: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Session, ApiErrors>;
  readonly listPeople: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listAdministrators: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listTeachers: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listStudents: (schoolId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
}

interface CoursesService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Course, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Course, ApiErrors>;
  readonly listClasses: (courseId: string, config?: PaginationConfig) => Stream.Stream<EdlinkClass, ApiErrors>;
}

interface SessionsService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Session, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Session, ApiErrors>;
}

interface SectionsService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Section, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Section, ApiErrors>;
  readonly listEnrollments: (sectionId: string, config?: PaginationConfig) => Stream.Stream<Enrollment, ApiErrors>;
  readonly listPeople: (sectionId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listTeachers: (sectionId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listStudents: (sectionId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
}

interface ClassesService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<EdlinkClass, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<EdlinkClass, ApiErrors>;
  readonly listSections: (classId: string, config?: PaginationConfig) => Stream.Stream<Section, ApiErrors>;
  readonly listEnrollments: (classId: string, config?: PaginationConfig) => Stream.Stream<Enrollment, ApiErrors>;
  readonly listPeople: (classId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listTeachers: (classId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly listStudents: (classId: string, config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
}

interface PeopleService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Person, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Person, ApiErrors>;
  readonly listEnrollments: (personId: string, config?: PaginationConfig) => Stream.Stream<Enrollment, ApiErrors>;
  readonly listDistricts: (personId: string, config?: PaginationConfig) => Stream.Stream<District, ApiErrors>;
  readonly listSchools: (personId: string, config?: PaginationConfig) => Stream.Stream<School, ApiErrors>;
  readonly listClasses: (personId: string, config?: PaginationConfig) => Stream.Stream<EdlinkClass, ApiErrors>;
  readonly listSections: (personId: string, config?: PaginationConfig) => Stream.Stream<Section, ApiErrors>;
  readonly listAgents: (personId: string, config?: PaginationConfig) => Stream.Stream<Agent, ApiErrors>;
}

interface EnrollmentsService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Enrollment, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Enrollment, ApiErrors>;
}

interface AgentsService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<Agent, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<Agent, ApiErrors>;
}

interface LicensesService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<License, ApiErrors>;
}

interface EventsService {
  readonly list: (config?: PaginationConfig) => Stream.Stream<EdlinkEvent, ApiErrors>;
  readonly fetch: (id: string) => Effect.Effect<EdlinkEvent, ApiErrors>;
}

interface AssignmentsService {
  readonly list: (classId: string, config?: PaginationConfig) => Stream.Stream<Assignment, ApiErrors>;
  readonly fetch: (classId: string, assignmentId: string) => Effect.Effect<Assignment, ApiErrors>;
  readonly create: (classId: string, body: Record<string, unknown>) => Effect.Effect<Assignment, ApiErrors>;
  readonly update: (options: AssignmentsApi.UpdateAssignmentOptions) => Effect.Effect<Assignment, ApiErrors>;
  readonly delete: (classId: string, assignmentId: string) => Effect.Effect<void, EdlinkApiError>;
}

interface CategoriesService {
  readonly list: (classId: string, config?: PaginationConfig) => Stream.Stream<Category, ApiErrors>;
  readonly fetch: (classId: string, categoryId: string) => Effect.Effect<Category, ApiErrors>;
  readonly create: (classId: string, body: Record<string, unknown>) => Effect.Effect<Category, ApiErrors>;
  readonly update: (options: CategoriesApi.UpdateCategoryOptions) => Effect.Effect<Category, ApiErrors>;
  readonly delete: (classId: string, categoryId: string) => Effect.Effect<void, EdlinkApiError>;
}

interface SubmissionsService {
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
}

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

/**
 * Edlink API Client — full Graph API coverage.
 *
 * Each entity group is accessible via a namespaced sub-service:
 *   client.districts.list()
 *   client.schools.fetch(id)
 *   client.assignments.create(classId, body)
 */
export class EdlinkClient extends Context.Tag("EdlinkClient")<
  EdlinkClient,
  {
    readonly events: EventsService;
    readonly districts: DistrictsService;
    readonly schools: SchoolsService;
    readonly courses: CoursesService;
    readonly sessions: SessionsService;
    readonly sections: SectionsService;
    readonly classes: ClassesService;
    readonly people: PeopleService;
    readonly enrollments: EnrollmentsService;
    readonly agents: AgentsService;
    readonly licenses: LicensesService;
    readonly assignments: AssignmentsService;
    readonly categories: CategoriesService;
    readonly submissions: SubmissionsService;
  }
>() {}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

const makeEdlinkClient = Effect.gen(function* () {
  const edlinkConfig = yield* EdlinkConfig;
  const httpClient = yield* HttpClient.HttpClient;

  const ctx: RequestContext = { config: edlinkConfig, httpClient };

  const defaultPagination: PaginationConfig = {
    type: "pages",
    maxPages: edlinkConfig.defaultMaxPages,
  };

  const pg = (p?: PaginationConfig) => p ?? defaultPagination;

  return {
    events: {
      list: (p?: PaginationConfig) => EventsApi.listEvents({ pagination: pg(p) }, ctx),
      fetch: (id: string) => EventsApi.fetchEvent({ eventId: id }, ctx),
    },

    districts: {
      list: (p?: PaginationConfig) => DistrictsApi.listDistricts(pg(p), ctx),
      fetch: (id: string) => DistrictsApi.fetchDistrict(id, ctx),
      listAdministrators: (districtId: string, p?: PaginationConfig) =>
        DistrictsApi.listDistrictAdministrators({ districtId, pagination: pg(p) }, ctx),
    },

    schools: {
      list: (p?: PaginationConfig) => SchoolsApi.listSchools(pg(p), ctx),
      fetch: (id: string) => SchoolsApi.fetchSchool(id, ctx),
      listClasses: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolClasses({ schoolId, pagination: pg(p) }, ctx),
      listCourses: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolCourses({ schoolId, pagination: pg(p) }, ctx),
      listSessions: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolSessions({ schoolId, pagination: pg(p) }, ctx),
      listPeople: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolPeople({ schoolId, pagination: pg(p) }, ctx),
      listAdministrators: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolAdministrators({ schoolId, pagination: pg(p) }, ctx),
      listTeachers: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolTeachers({ schoolId, pagination: pg(p) }, ctx),
      listStudents: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolStudents({ schoolId, pagination: pg(p) }, ctx),
    },

    courses: {
      list: (p?: PaginationConfig) => CoursesApi.listCourses(pg(p), ctx),
      fetch: (id: string) => CoursesApi.fetchCourse(id, ctx),
      listClasses: (courseId: string, p?: PaginationConfig) =>
        CoursesApi.listCourseClasses({ courseId, pagination: pg(p) }, ctx),
    },

    sessions: {
      list: (p?: PaginationConfig) => SessionsApi.listSessions(pg(p), ctx),
      fetch: (id: string) => SessionsApi.fetchSession(id, ctx),
    },

    sections: {
      list: (p?: PaginationConfig) => SectionsApi.listSections(pg(p), ctx),
      fetch: (id: string) => SectionsApi.fetchSection(id, ctx),
      listEnrollments: (sectionId: string, p?: PaginationConfig) =>
        SectionsApi.listSectionEnrollments({ sectionId, pagination: pg(p) }, ctx),
      listPeople: (sectionId: string, p?: PaginationConfig) =>
        SectionsApi.listSectionPeople({ sectionId, pagination: pg(p) }, ctx),
      listTeachers: (sectionId: string, p?: PaginationConfig) =>
        SectionsApi.listSectionTeachers({ sectionId, pagination: pg(p) }, ctx),
      listStudents: (sectionId: string, p?: PaginationConfig) =>
        SectionsApi.listSectionStudents({ sectionId, pagination: pg(p) }, ctx),
    },

    classes: {
      list: (p?: PaginationConfig) => ClassesApi.listClasses(pg(p), ctx),
      fetch: (id: string) => ClassesApi.fetchClass(id, ctx),
      listSections: (classId: string, p?: PaginationConfig) =>
        ClassesApi.listClassSections({ classId, pagination: pg(p) }, ctx),
      listEnrollments: (classId: string, p?: PaginationConfig) =>
        ClassesApi.listClassEnrollments({ classId, pagination: pg(p) }, ctx),
      listPeople: (classId: string, p?: PaginationConfig) =>
        ClassesApi.listClassPeople({ classId, pagination: pg(p) }, ctx),
      listTeachers: (classId: string, p?: PaginationConfig) =>
        ClassesApi.listClassTeachers({ classId, pagination: pg(p) }, ctx),
      listStudents: (classId: string, p?: PaginationConfig) =>
        ClassesApi.listClassStudents({ classId, pagination: pg(p) }, ctx),
    },

    people: {
      list: (p?: PaginationConfig) => PeopleApi.listPeople(pg(p), ctx),
      fetch: (id: string) => PeopleApi.fetchPerson(id, ctx),
      listEnrollments: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonEnrollments({ personId, pagination: pg(p) }, ctx),
      listDistricts: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonDistricts({ personId, pagination: pg(p) }, ctx),
      listSchools: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonSchools({ personId, pagination: pg(p) }, ctx),
      listClasses: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonClasses({ personId, pagination: pg(p) }, ctx),
      listSections: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonSections({ personId, pagination: pg(p) }, ctx),
      listAgents: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonAgents({ personId, pagination: pg(p) }, ctx),
    },

    enrollments: {
      list: (p?: PaginationConfig) => EnrollmentsApi.listEnrollments(pg(p), ctx),
      fetch: (id: string) => EnrollmentsApi.fetchEnrollment(id, ctx),
    },

    agents: {
      list: (p?: PaginationConfig) => AgentsApi.listAgents(pg(p), ctx),
      fetch: (id: string) => AgentsApi.fetchAgent(id, ctx),
    },

    licenses: {
      list: (p?: PaginationConfig) => LicensesApi.listLicenses(pg(p), ctx),
    },

    assignments: {
      list: (classId: string, p?: PaginationConfig) =>
        AssignmentsApi.listAssignments({ classId, pagination: pg(p) }, ctx),
      fetch: (classId: string, assignmentId: string) => AssignmentsApi.fetchAssignment({ classId, assignmentId }, ctx),
      create: (classId: string, body: Record<string, unknown>) =>
        AssignmentsApi.createAssignment({ classId, body }, ctx),
      update: (options: AssignmentsApi.UpdateAssignmentOptions) => AssignmentsApi.updateAssignment(options, ctx),
      delete: (classId: string, assignmentId: string) =>
        AssignmentsApi.deleteAssignment({ classId, assignmentId }, ctx),
    },

    categories: {
      list: (classId: string, p?: PaginationConfig) =>
        CategoriesApi.listCategories({ classId, pagination: pg(p) }, ctx),
      fetch: (classId: string, categoryId: string) => CategoriesApi.fetchCategory({ classId, categoryId }, ctx),
      create: (classId: string, body: Record<string, unknown>) => CategoriesApi.createCategory({ classId, body }, ctx),
      update: (options: CategoriesApi.UpdateCategoryOptions) => CategoriesApi.updateCategory(options, ctx),
      delete: (classId: string, categoryId: string) => CategoriesApi.deleteCategory({ classId, categoryId }, ctx),
    },

    submissions: {
      list: (classId: string, assignmentId: string, p?: PaginationConfig) =>
        SubmissionsApi.listSubmissions({ classId, assignmentId, pagination: pg(p) }, ctx),
      fetch: (options: SubmissionsApi.FetchSubmissionOptions) => SubmissionsApi.fetchSubmission(options, ctx),
      submit: (options: SubmissionsApi.SubmitAttemptOptions) => SubmissionsApi.submitAttempt(options, ctx),
      reclaim: (classId: string, assignmentId: string) =>
        SubmissionsApi.reclaimSubmission({ classId, assignmentId }, ctx),
      return: (options: SubmissionsApi.ReturnSubmissionOptions) => SubmissionsApi.returnSubmission(options, ctx),
      update: (options: SubmissionsApi.UpdateSubmissionOptions) => SubmissionsApi.updateSubmission(options, ctx),
    },
  };
});

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

/** Live layer — requires `EdlinkConfig` and `HttpClient` from context */
export const EdlinkClientLive: Layer.Layer<EdlinkClient, never, EdlinkConfig | HttpClient.HttpClient> = Layer.effect(
  EdlinkClient,
  makeEdlinkClient,
);
