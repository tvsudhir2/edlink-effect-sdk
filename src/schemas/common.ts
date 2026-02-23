import { Schema } from "effect";

// ---------------------------------------------------------------------------
// Enums — modeled as Schema.Literals arrays for runtime validation
// ---------------------------------------------------------------------------

// --- Subject (CEDS + Edlink) ---
export const Subject = Schema.Literals([
  "CEDS.01",
  "CEDS.02",
  "CEDS.03",
  "CEDS.04",
  "CEDS.05",
  "CEDS.07",
  "CEDS.08",
  "CEDS.09",
  "CEDS.10",
  "CEDS.11",
  "CEDS.12",
  "CEDS.13",
  "CEDS.14",
  "CEDS.15",
  "CEDS.16",
  "CEDS.17",
  "CEDS.18",
  "CEDS.19",
  "CEDS.20",
  "CEDS.21",
  "CEDS.22",
  "CEDS.23",
  "CEDS.24",
  "EL.01",
  "EL.02",
]);
export type Subject = typeof Subject.Type;

// --- GradeLevel ---
export const GradeLevel = Schema.Literals([
  "Birth",
  "Prenatal",
  "IT",
  "PR",
  "PK",
  "TK",
  "KG",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "PS",
  "UG",
  "Other",
]);
export type GradeLevel = typeof GradeLevel.Type;

// --- Role ---
export const Role = Schema.Literals([
  "student",
  "district-administrator",
  "administrator",
  "teacher",
  "ta",
  "staff",
  "aide",
  "observer",
  "parent",
  "guardian",
  "designer",
  "member",
]);
export type Role = typeof Role.Type;

// --- Gender ---
export const Gender = Schema.Literals(["male", "female", "other"]);
export type Gender = typeof Gender.Type;

// --- Race ---
export const Race = Schema.Literals([
  "american-indian-or-alaska-native",
  "asian",
  "black-or-african-american",
  "native-hawaiian-or-other-pacific-islander",
  "white",
]);
export type Race = typeof Race.Type;

// --- ResidenceStatus ---
export const ResidenceStatus = Schema.Literals(["01652", "01653", "01654", "01655", "01656"]);
export type ResidenceStatus = typeof ResidenceStatus.Type;

// --- EventType ---
export const EventType = Schema.Literals(["created", "updated", "deleted"]);
export type EventType = typeof EventType.Type;

// --- EventTarget ---
export const EventTarget = Schema.Literals([
  "agent",
  "class",
  "course",
  "district",
  "enrollment",
  "person",
  "school",
  "section",
  "session",
]);
export type EventTarget = typeof EventTarget.Type;

// --- ClassState ---
export const ClassState = Schema.Literals(["template", "upcoming", "inactive", "active", "completed", "archived"]);
export type ClassState = typeof ClassState.Type;

// --- EnrollmentState ---
export const EnrollmentState = Schema.Literals(["active", "inactive", "dropped", "upcoming", "pending", "completed"]);
export type EnrollmentState = typeof EnrollmentState.Type;

// --- SessionType ---
export const SessionType = Schema.Literals(["semester", "term", "grading_period", "school_year"]);
export type SessionType = typeof SessionType.Type;

// --- SessionState ---
export const SessionState = Schema.Literals(["upcoming", "active", "completed"]);
export type SessionState = typeof SessionState.Type;

// --- SectionState ---
export const SectionState = Schema.Literals(["upcoming", "inactive", "active", "completed", "archived"]);
export type SectionState = typeof SectionState.Type;

// --- AgentRelationship ---
export const AgentRelationship = Schema.Literals(["parent", "guardian", "aide"]);
export type AgentRelationship = typeof AgentRelationship.Type;

// --- AssignmentState ---
export const AssignmentState = Schema.Literals(["draft", "scheduled", "open", "locked"]);
export type AssignmentState = typeof AssignmentState.Type;

// --- AssignmentAssigneeMode ---
export const AssignmentAssigneeMode = Schema.Literals(["all", "individuals"]);
export type AssignmentAssigneeMode = typeof AssignmentAssigneeMode.Type;

// --- SubmissionState ---
export const SubmissionState = Schema.Literals(["created", "submitted", "returned", "reclaimed"]);
export type SubmissionState = typeof SubmissionState.Type;

// --- SubmissionFlag ---
export const SubmissionFlag = Schema.Literals(["missing", "late", "excused"]);
export type SubmissionFlag = typeof SubmissionFlag.Type;

// --- AttachmentType ---
export const AttachmentType = Schema.Literals(["text", "link", "file", "drive", "lti"]);
export type AttachmentType = typeof AttachmentType.Type;

// --- ProductState ---
export const ProductState = Schema.Literals([
  "active",
  "inactive",
  "upcoming",
  "development",
  "sunsetting",
  "deprecated",
]);
export type ProductState = typeof ProductState.Type;

// ---------------------------------------------------------------------------
// Value objects — small reusable Schema.Class types
// ---------------------------------------------------------------------------

export class Identifier extends Schema.Class<Identifier>("Identifier")({
  type: Schema.String,
  value: Schema.String,
}) {}
