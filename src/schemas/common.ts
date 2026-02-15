import { Schema } from "effect";

// ---------------------------------------------------------------------------
// Enums — modeled as Schema.Literal unions for runtime validation
// ---------------------------------------------------------------------------

// --- Subject (CEDS + Edlink) ---
export const Subject = Schema.Literal(
  "CEDS.01", "CEDS.02", "CEDS.03", "CEDS.04", "CEDS.05",
  "CEDS.07", "CEDS.08", "CEDS.09", "CEDS.10", "CEDS.11",
  "CEDS.12", "CEDS.13", "CEDS.14", "CEDS.15", "CEDS.16",
  "CEDS.17", "CEDS.18", "CEDS.19", "CEDS.20", "CEDS.21",
  "CEDS.22", "CEDS.23", "CEDS.24",
  "EL.01", "EL.02",
);
export type Subject = typeof Subject.Type;

// --- GradeLevel ---
export const GradeLevel = Schema.Literal(
  "Birth", "Prenatal", "IT", "PR", "PK", "TK", "KG",
  "01", "02", "03", "04", "05", "06", "07", "08", "09",
  "10", "11", "12", "13",
  "PS", "UG", "Other",
);
export type GradeLevel = typeof GradeLevel.Type;

// --- Role ---
export const Role = Schema.Literal(
  "student", "district-administrator", "administrator",
  "teacher", "ta", "staff", "aide",
  "observer", "parent", "guardian",
  "designer", "member",
);
export type Role = typeof Role.Type;

// --- Gender ---
export const Gender = Schema.Literal("male", "female", "other");
export type Gender = typeof Gender.Type;

// --- Race ---
export const Race = Schema.Literal(
  "american-indian-or-alaska-native",
  "asian",
  "black-or-african-american",
  "native-hawaiian-or-other-pacific-islander",
  "white",
);
export type Race = typeof Race.Type;

// --- ResidenceStatus ---
export const ResidenceStatus = Schema.Literal(
  "01652", "01653", "01654", "01655", "01656",
);
export type ResidenceStatus = typeof ResidenceStatus.Type;

// --- EventType ---
export const EventType = Schema.Literal("created", "updated", "deleted");
export type EventType = typeof EventType.Type;

// --- EventTarget ---
export const EventTarget = Schema.Literal(
  "agent", "class", "course", "district",
  "enrollment", "person", "school", "section", "session",
);
export type EventTarget = typeof EventTarget.Type;

// --- ClassState ---
export const ClassState = Schema.Literal(
  "template", "upcoming", "inactive", "active", "completed", "archived",
);
export type ClassState = typeof ClassState.Type;

// --- EnrollmentState ---
export const EnrollmentState = Schema.Literal(
  "active", "inactive", "dropped", "upcoming", "pending", "completed",
);
export type EnrollmentState = typeof EnrollmentState.Type;

// --- SessionType ---
export const SessionType = Schema.Literal(
  "semester", "term", "grading_period", "school_year",
);
export type SessionType = typeof SessionType.Type;

// --- SessionState ---
export const SessionState = Schema.Literal("upcoming", "active", "completed");
export type SessionState = typeof SessionState.Type;

// --- SectionState ---
export const SectionState = Schema.Literal(
  "upcoming", "inactive", "active", "completed", "archived",
);
export type SectionState = typeof SectionState.Type;

// --- AgentRelationship ---
export const AgentRelationship = Schema.Literal("parent", "guardian", "aide");
export type AgentRelationship = typeof AgentRelationship.Type;

// --- AssignmentState ---
export const AssignmentState = Schema.Literal(
  "draft", "scheduled", "open", "locked",
);
export type AssignmentState = typeof AssignmentState.Type;

// --- AssignmentAssigneeMode ---
export const AssignmentAssigneeMode = Schema.Literal("all", "individuals");
export type AssignmentAssigneeMode = typeof AssignmentAssigneeMode.Type;

// --- SubmissionState ---
export const SubmissionState = Schema.Literal(
  "created", "submitted", "returned", "reclaimed",
);
export type SubmissionState = typeof SubmissionState.Type;

// --- SubmissionFlag ---
export const SubmissionFlag = Schema.Literal("missing", "late", "excused");
export type SubmissionFlag = typeof SubmissionFlag.Type;

// --- AttachmentType ---
export const AttachmentType = Schema.Literal(
  "text", "link", "file", "drive", "lti",
);
export type AttachmentType = typeof AttachmentType.Type;

// --- ProductState ---
export const ProductState = Schema.Literal(
  "active", "inactive", "upcoming",
  "development", "sunsetting", "deprecated",
);
export type ProductState = typeof ProductState.Type;

// ---------------------------------------------------------------------------
// Value objects — small reusable Schema.Class types
// ---------------------------------------------------------------------------

export class Identifier extends Schema.Class<Identifier>("Identifier")({
  type: Schema.String,
  value: Schema.String,
}) {}
