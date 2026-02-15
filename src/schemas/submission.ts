import { Schema } from "effect";
import { SubmissionFlag, SubmissionState } from "./common.js";
import { Attachment } from "./attachment.js";

// ---------------------------------------------------------------------------
// Attempt — a single submission attempt by a student
// ---------------------------------------------------------------------------

export class Attempt extends Schema.Class<Attempt>("Attempt")({
  created_date: Schema.String,
  attachments: Schema.Array(Attachment),
}) {}

// ---------------------------------------------------------------------------
// Submission — a student's submission for an assignment
// ---------------------------------------------------------------------------

export class Submission extends Schema.Class<Submission>("Submission")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  state: SubmissionState,
  flags: Schema.Array(SubmissionFlag),
  attempts: Schema.Array(Attempt),
  grade_comment: Schema.NullOr(Schema.String),
  grade_points: Schema.NullOr(Schema.Number),
  grade: Schema.NullOr(Schema.String),
  extra_attempts: Schema.Number,
  override_due_date: Schema.NullOr(Schema.String),
  grader_id: Schema.NullOr(Schema.String),
  person_id: Schema.String,
}) {}
