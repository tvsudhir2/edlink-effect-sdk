import { Schema } from "effect";
import { Attachment } from "./attachment.js";
import { SubmissionFlag, SubmissionState } from "./common.js";

// ---------------------------------------------------------------------------
// Attempt — a single submission attempt by a student
// ---------------------------------------------------------------------------

export class Attempt extends Schema.Class<Attempt>("Attempt")({
  // --- Other fields ---
  attachments: Schema.Array(Attachment),
  created_date: Schema.String,
}) {}

// ---------------------------------------------------------------------------
// Submission — a student's submission for an assignment
// ---------------------------------------------------------------------------

export class Submission extends Schema.Class<Submission>("Submission")({
  // --- ID fields ---
  grader_id: Schema.NullOr(Schema.String),
  id: Schema.String,
  person_id: Schema.String,

  // --- Other fields ---
  attempts: Schema.Array(Attempt),
  created_date: Schema.String,
  extra_attempts: Schema.Number,
  flags: Schema.Array(SubmissionFlag),
  grade: Schema.NullOr(Schema.String),
  grade_comment: Schema.NullOr(Schema.String),
  grade_points: Schema.NullOr(Schema.Number),
  override_due_date: Schema.NullOr(Schema.String),
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  state: SubmissionState,
  updated_date: Schema.String,
}) {}
