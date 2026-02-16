import { HttpClient } from "@effect/platform";
import { Context, Effect, Layer, type Stream } from "effect";
import * as AgentsApi from "./api/v2/agents.js";
import * as AssignmentsApi from "./api/v2/assignments.js";
import * as CategoriesApi from "./api/v2/categories.js";
import * as ClassesApi from "./api/v2/classes.js";
import * as CoursesApi from "./api/v2/courses.js";
import * as DistrictsApi from "./api/v2/districts.js";
import * as EnrollmentsApi from "./api/v2/enrollments.js";
import { createEventsStream } from "./api/v2/events.js";
import * as LicensesApi from "./api/v2/licenses.js";
import * as PeopleApi from "./api/v2/people.js";
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

interface AssignmentsService {
  readonly list: (classId: string, config?: PaginationConfig) => Stream.Stream<Assignment, ApiErrors>;
  readonly fetch: (classId: string, assignmentId: string) => Effect.Effect<Assignment, ApiErrors>;
  readonly create: (classId: string, body: Record<string, unknown>) => Effect.Effect<Assignment, ApiErrors>;
  readonly update: (
    classId: string,
    assignmentId: string,
    body: Record<string, unknown>,
  ) => Effect.Effect<Assignment, ApiErrors>;
  readonly delete: (classId: string, assignmentId: string) => Effect.Effect<void, EdlinkApiError>;
}

interface CategoriesService {
  readonly list: (classId: string, config?: PaginationConfig) => Stream.Stream<Category, ApiErrors>;
  readonly fetch: (classId: string, categoryId: string) => Effect.Effect<Category, ApiErrors>;
  readonly create: (classId: string, body: Record<string, unknown>) => Effect.Effect<Category, ApiErrors>;
  readonly update: (
    classId: string,
    categoryId: string,
    body: Record<string, unknown>,
  ) => Effect.Effect<Category, ApiErrors>;
  readonly delete: (classId: string, categoryId: string) => Effect.Effect<void, EdlinkApiError>;
}

interface SubmissionsService {
  readonly list: (
    classId: string,
    assignmentId: string,
    config?: PaginationConfig,
  ) => Stream.Stream<Submission, ApiErrors>;
  readonly fetch: (classId: string, assignmentId: string, submissionId: string) => Effect.Effect<Submission, ApiErrors>;
  readonly submit: (
    classId: string,
    assignmentId: string,
    body: Record<string, unknown>,
  ) => Effect.Effect<Submission, ApiErrors>;
  readonly reclaim: (classId: string, assignmentId: string) => Effect.Effect<Submission, ApiErrors>;
  readonly return: (
    classId: string,
    assignmentId: string,
    submissionId: string,
  ) => Effect.Effect<Submission, ApiErrors>;
  readonly update: (
    classId: string,
    assignmentId: string,
    submissionId: string,
    body: Record<string, unknown>,
  ) => Effect.Effect<Submission, ApiErrors>;
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
    /** Lazy, paginated stream of Edlink events */
    readonly getEventsStream: (
      config?: PaginationConfig,
    ) => Stream.Stream<EdlinkEvent, EdlinkApiError | EdlinkDecodeError>;

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

  const defaultPagination: PaginationConfig = {
    type: "pages",
    maxPages: edlinkConfig.defaultMaxPages,
  };

  const pg = (p?: PaginationConfig) => p ?? defaultPagination;

  return {
    getEventsStream: (pagination?: PaginationConfig) => createEventsStream(edlinkConfig, httpClient, pg(pagination)),

    districts: {
      list: (p?: PaginationConfig) => DistrictsApi.listDistricts(edlinkConfig, httpClient, pg(p)),
      fetch: (id: string) => DistrictsApi.fetchDistrict(edlinkConfig, httpClient, id),
      listAdministrators: (districtId: string, p?: PaginationConfig) =>
        DistrictsApi.listDistrictAdministrators(edlinkConfig, httpClient, districtId, pg(p)),
    },

    schools: {
      list: (p?: PaginationConfig) => SchoolsApi.listSchools(edlinkConfig, httpClient, pg(p)),
      fetch: (id: string) => SchoolsApi.fetchSchool(edlinkConfig, httpClient, id),
      listClasses: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolClasses(edlinkConfig, httpClient, schoolId, pg(p)),
      listCourses: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolCourses(edlinkConfig, httpClient, schoolId, pg(p)),
      listSessions: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolSessions(edlinkConfig, httpClient, schoolId, pg(p)),
      listPeople: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolPeople(edlinkConfig, httpClient, schoolId, pg(p)),
      listAdministrators: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolAdministrators(edlinkConfig, httpClient, schoolId, pg(p)),
      listTeachers: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolTeachers(edlinkConfig, httpClient, schoolId, pg(p)),
      listStudents: (schoolId: string, p?: PaginationConfig) =>
        SchoolsApi.listSchoolStudents(edlinkConfig, httpClient, schoolId, pg(p)),
    },

    courses: {
      list: (p?: PaginationConfig) => CoursesApi.listCourses(edlinkConfig, httpClient, pg(p)),
      fetch: (id: string) => CoursesApi.fetchCourse(edlinkConfig, httpClient, id),
      listClasses: (courseId: string, p?: PaginationConfig) =>
        CoursesApi.listCourseClasses(edlinkConfig, httpClient, courseId, pg(p)),
    },

    sessions: {
      list: (p?: PaginationConfig) => SessionsApi.listSessions(edlinkConfig, httpClient, pg(p)),
      fetch: (id: string) => SessionsApi.fetchSession(edlinkConfig, httpClient, id),
    },

    sections: {
      list: (p?: PaginationConfig) => SectionsApi.listSections(edlinkConfig, httpClient, pg(p)),
      fetch: (id: string) => SectionsApi.fetchSection(edlinkConfig, httpClient, id),
      listEnrollments: (sectionId: string, p?: PaginationConfig) =>
        SectionsApi.listSectionEnrollments(edlinkConfig, httpClient, sectionId, pg(p)),
      listPeople: (sectionId: string, p?: PaginationConfig) =>
        SectionsApi.listSectionPeople(edlinkConfig, httpClient, sectionId, pg(p)),
      listTeachers: (sectionId: string, p?: PaginationConfig) =>
        SectionsApi.listSectionTeachers(edlinkConfig, httpClient, sectionId, pg(p)),
      listStudents: (sectionId: string, p?: PaginationConfig) =>
        SectionsApi.listSectionStudents(edlinkConfig, httpClient, sectionId, pg(p)),
    },

    classes: {
      list: (p?: PaginationConfig) => ClassesApi.listClasses(edlinkConfig, httpClient, pg(p)),
      fetch: (id: string) => ClassesApi.fetchClass(edlinkConfig, httpClient, id),
      listSections: (classId: string, p?: PaginationConfig) =>
        ClassesApi.listClassSections(edlinkConfig, httpClient, classId, pg(p)),
      listEnrollments: (classId: string, p?: PaginationConfig) =>
        ClassesApi.listClassEnrollments(edlinkConfig, httpClient, classId, pg(p)),
      listPeople: (classId: string, p?: PaginationConfig) =>
        ClassesApi.listClassPeople(edlinkConfig, httpClient, classId, pg(p)),
      listTeachers: (classId: string, p?: PaginationConfig) =>
        ClassesApi.listClassTeachers(edlinkConfig, httpClient, classId, pg(p)),
      listStudents: (classId: string, p?: PaginationConfig) =>
        ClassesApi.listClassStudents(edlinkConfig, httpClient, classId, pg(p)),
    },

    people: {
      list: (p?: PaginationConfig) => PeopleApi.listPeople(edlinkConfig, httpClient, pg(p)),
      fetch: (id: string) => PeopleApi.fetchPerson(edlinkConfig, httpClient, id),
      listEnrollments: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonEnrollments(edlinkConfig, httpClient, personId, pg(p)),
      listDistricts: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonDistricts(edlinkConfig, httpClient, personId, pg(p)),
      listSchools: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonSchools(edlinkConfig, httpClient, personId, pg(p)),
      listClasses: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonClasses(edlinkConfig, httpClient, personId, pg(p)),
      listSections: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonSections(edlinkConfig, httpClient, personId, pg(p)),
      listAgents: (personId: string, p?: PaginationConfig) =>
        PeopleApi.listPersonAgents(edlinkConfig, httpClient, personId, pg(p)),
    },

    enrollments: {
      list: (p?: PaginationConfig) => EnrollmentsApi.listEnrollments(edlinkConfig, httpClient, pg(p)),
      fetch: (id: string) => EnrollmentsApi.fetchEnrollment(edlinkConfig, httpClient, id),
    },

    agents: {
      list: (p?: PaginationConfig) => AgentsApi.listAgents(edlinkConfig, httpClient, pg(p)),
      fetch: (id: string) => AgentsApi.fetchAgent(edlinkConfig, httpClient, id),
    },

    licenses: {
      list: (p?: PaginationConfig) => LicensesApi.listLicenses(edlinkConfig, httpClient, pg(p)),
    },

    assignments: {
      list: (classId: string, p?: PaginationConfig) =>
        AssignmentsApi.listAssignments(edlinkConfig, httpClient, classId, pg(p)),
      fetch: (classId: string, assignmentId: string) =>
        AssignmentsApi.fetchAssignment(edlinkConfig, httpClient, classId, assignmentId),
      create: (classId: string, body: Record<string, unknown>) =>
        AssignmentsApi.createAssignment(edlinkConfig, httpClient, classId, body),
      update: (classId: string, assignmentId: string, body: Record<string, unknown>) =>
        AssignmentsApi.updateAssignment(edlinkConfig, httpClient, classId, assignmentId, body),
      delete: (classId: string, assignmentId: string) =>
        AssignmentsApi.deleteAssignment(edlinkConfig, httpClient, classId, assignmentId),
    },

    categories: {
      list: (classId: string, p?: PaginationConfig) =>
        CategoriesApi.listCategories(edlinkConfig, httpClient, classId, pg(p)),
      fetch: (classId: string, categoryId: string) =>
        CategoriesApi.fetchCategory(edlinkConfig, httpClient, classId, categoryId),
      create: (classId: string, body: Record<string, unknown>) =>
        CategoriesApi.createCategory(edlinkConfig, httpClient, classId, body),
      update: (classId: string, categoryId: string, body: Record<string, unknown>) =>
        CategoriesApi.updateCategory(edlinkConfig, httpClient, classId, categoryId, body),
      delete: (classId: string, categoryId: string) =>
        CategoriesApi.deleteCategory(edlinkConfig, httpClient, classId, categoryId),
    },

    submissions: {
      list: (classId: string, assignmentId: string, p?: PaginationConfig) =>
        SubmissionsApi.listSubmissions(edlinkConfig, httpClient, classId, assignmentId, pg(p)),
      fetch: (classId: string, assignmentId: string, submissionId: string) =>
        SubmissionsApi.fetchSubmission(edlinkConfig, httpClient, classId, assignmentId, submissionId),
      submit: (classId: string, assignmentId: string, body: Record<string, unknown>) =>
        SubmissionsApi.submitAttempt(edlinkConfig, httpClient, classId, assignmentId, body),
      reclaim: (classId: string, assignmentId: string) =>
        SubmissionsApi.reclaimSubmission(edlinkConfig, httpClient, classId, assignmentId),
      return: (classId: string, assignmentId: string, submissionId: string) =>
        SubmissionsApi.returnSubmission(edlinkConfig, httpClient, classId, assignmentId, submissionId),
      update: (classId: string, assignmentId: string, submissionId: string, body: Record<string, unknown>) =>
        SubmissionsApi.updateSubmission(edlinkConfig, httpClient, classId, assignmentId, submissionId, body),
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
