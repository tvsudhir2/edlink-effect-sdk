/**
 * Shared test fixtures — valid schema-conforming objects reused across test files.
 * Each fixture satisfies ALL required fields for its schema.
 */

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

export const agentFixture = {
  id: "agent-001",
  observer_id: "person-010",
  target_id: "person-020",
  created_date: "2026-01-01T00:00:00.000Z",
  identifiers: [],
  properties: {},
  relationship: "parent" as const,
  updated_date: "2026-01-01T00:00:00.000Z",
};

export const agentFixture2 = { ...agentFixture, id: "agent-002" };
export const agentFixture3 = { ...agentFixture, id: "agent-003" };

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export const categoryFixture = {
  id: "cat-001",
  created_date: "2026-01-01T00:00:00.000Z",
  drop_lowest: 0,
  identifiers: [],
  position: 1,
  properties: {},
  title: "Homework",
  updated_date: "2026-01-01T00:00:00.000Z",
  weight: 0.25,
};

export const categoryFixture2 = { ...categoryFixture, id: "cat-002", title: "Exams" };
export const categoryFixture3 = { ...categoryFixture, id: "cat-003", title: "Labs" };

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

export const classFixture = {
  course_id: null,
  id: "cls-001",
  product_ids: [],
  school_id: "sch-001",
  session_ids: [],
  created_date: "2026-01-01T00:00:00.000Z",
  description: null,
  grade_levels: [],
  identifiers: [],
  locale: null,
  name: "Algebra I",
  periods: [],
  picture_url: null,
  properties: {},
  state: "active" as const,
  subjects: [],
  time_zone: null,
  updated_date: "2026-01-01T00:00:00.000Z",
};

export const classFixture2 = { ...classFixture, id: "cls-002", name: "Algebra II" };
export const classFixture3 = { ...classFixture, id: "cls-003", name: "Geometry" };

// ---------------------------------------------------------------------------
// Course
// ---------------------------------------------------------------------------

export const courseFixture = {
  district_id: "dist-001",
  id: "crs-001",
  school_id: null,
  session_id: null,
  code: null,
  created_date: "2026-01-01T00:00:00.000Z",
  grade_levels: [],
  identifiers: [],
  name: "Mathematics",
  properties: {},
  subjects: [],
  updated_date: "2026-01-01T00:00:00.000Z",
};

export const courseFixture2 = { ...courseFixture, id: "crs-002", name: "Science" };
export const courseFixture3 = { ...courseFixture, id: "crs-003", name: "English" };

// ---------------------------------------------------------------------------
// District
// ---------------------------------------------------------------------------

export const districtFixture = {
  id: "dist-001",
  address: null,
  created_date: "2026-01-01T00:00:00.000Z",
  identifiers: [],
  locale: null,
  name: "Springfield USD",
  picture_url: null,
  properties: {},
  time_zone: null,
  updated_date: "2026-01-01T00:00:00.000Z",
};

export const districtFixture2 = { ...districtFixture, id: "dist-002", name: "Shelbyville USD" };
export const districtFixture3 = { ...districtFixture, id: "dist-003", name: "Capital City USD" };

// ---------------------------------------------------------------------------
// Enrollment
// ---------------------------------------------------------------------------

export const enrollmentFixture = {
  class_id: "cls-001",
  id: "enr-001",
  person_id: "per-001",
  section_id: null,
  created_date: "2026-01-01T00:00:00.000Z",
  end_date: null,
  identifiers: [],
  primary: null,
  properties: {},
  role: "student" as const,
  start_date: null,
  state: "active" as const,
  updated_date: "2026-01-01T00:00:00.000Z",
};

export const enrollmentFixture2 = { ...enrollmentFixture, id: "enr-002" };
export const enrollmentFixture3 = { ...enrollmentFixture, id: "enr-003" };

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export const eventFixture = {
  id: "evt-001",
  type: "person.created",
};

export const eventFixture2 = { ...eventFixture, id: "evt-002", type: "enrollment.created" };
export const eventFixture3 = { ...eventFixture, id: "evt-003", type: "class.updated" };

// ---------------------------------------------------------------------------
// License
// ---------------------------------------------------------------------------

export const licenseFixture = {
  integration_id: "int-001",
  product_id: "prod-001",
  class_count: 10,
  person_count: 200,
  school_count: 5,
};

export const licenseFixture2 = { ...licenseFixture, product_id: "prod-002" };
export const licenseFixture3 = { ...licenseFixture, product_id: "prod-003" };

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------

export const personFixture = {
  district_id: "dist-001",
  id: "per-001",
  product_ids: [],
  school_ids: ["sch-001"],
  created_date: "2026-01-01T00:00:00.000Z",
  display_name: "Jane Doe",
  email: "jane@example.com",
  first_name: "Jane",
  grade_levels: [],
  graduation_year: null,
  identifiers: [],
  last_name: "Doe",
  locale: null,
  middle_name: null,
  phone: null,
  picture_url: null,
  properties: {},
  roles: ["student" as const],
  time_zone: null,
  updated_date: "2026-01-01T00:00:00.000Z",
};

export const personFixture2 = { ...personFixture, id: "per-002", display_name: "John Smith" };
export const personFixture3 = { ...personFixture, id: "per-003", display_name: "Alex Lee" };

// ---------------------------------------------------------------------------
// School
// ---------------------------------------------------------------------------

export const schoolFixture = {
  district_id: "dist-001",
  id: "sch-001",
  product_ids: [],
  address: null,
  created_date: "2026-01-01T00:00:00.000Z",
  grade_levels: [],
  identifiers: [],
  locale: null,
  name: "Springfield Elementary",
  picture_url: null,
  properties: {},
  time_zone: null,
  updated_date: "2026-01-01T00:00:00.000Z",
};

export const schoolFixture2 = { ...schoolFixture, id: "sch-002", name: "Springfield High" };
export const schoolFixture3 = { ...schoolFixture, id: "sch-003", name: "Springfield Middle" };

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export const sectionFixture = {
  class_id: "cls-001",
  id: "sec-001",
  created_date: "2026-01-01T00:00:00.000Z",
  description: null,
  identifiers: [],
  locale: null,
  name: "Section A",
  periods: [],
  picture_url: null,
  properties: {},
  state: "active" as const,
  time_zone: null,
  updated_date: "2026-01-01T00:00:00.000Z",
};

export const sectionFixture2 = { ...sectionFixture, id: "sec-002", name: "Section B" };
export const sectionFixture3 = { ...sectionFixture, id: "sec-003", name: "Section C" };

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export const sessionFixture = {
  district_id: "dist-001",
  id: "ses-001",
  school_id: null,
  created_date: "2026-01-01T00:00:00.000Z",
  end_date: null,
  identifiers: [],
  name: "Fall 2026",
  properties: {},
  start_date: "2026-08-15T00:00:00.000Z",
  state: "upcoming" as const,
  type: "semester" as const,
  updated_date: "2026-01-01T00:00:00.000Z",
};

export const sessionFixture2 = { ...sessionFixture, id: "ses-002", name: "Spring 2026" };
export const sessionFixture3 = { ...sessionFixture, id: "ses-003", name: "Summer 2026" };

// ---------------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------------

export const submissionFixture = {
  grader_id: null,
  id: "sub-001",
  person_id: "per-001",
  attempts: [],
  created_date: "2026-01-15T00:00:00.000Z",
  extra_attempts: 0,
  flags: [],
  grade: null,
  grade_comment: null,
  grade_points: null,
  override_due_date: null,
  properties: {},
  state: "created" as const,
  updated_date: "2026-01-15T00:00:00.000Z",
};

export const submissionFixture2 = { ...submissionFixture, id: "sub-002", state: "submitted" as const };
export const submissionFixture3 = { ...submissionFixture, id: "sub-003", state: "returned" as const };

// ---------------------------------------------------------------------------
// Token / Profile (for OAuth & Profile tests)
// ---------------------------------------------------------------------------

export const tokenResponseFixture = {
  access_token: "access-abc-123",
  expires_in: 3600,
  refresh_token: "refresh-xyz-789",
  token_type: "bearer",
};

export const userProfileFixture = {
  id: "user-001",
  created_date: "2026-01-01T00:00:00.000Z",
  display_name: "Test User",
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  locale: null,
  picture_url: null,
  time_zone: null,
  updated_date: "2026-01-01T00:00:00.000Z",
};
