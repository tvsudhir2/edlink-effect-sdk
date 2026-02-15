import { Schema } from "effect";
import { AssignmentAssigneeMode, AssignmentState } from "./common.js";
import { Attachment } from "./attachment.js";

// ---------------------------------------------------------------------------
// Assignment — a task or activity assigned to students
// ---------------------------------------------------------------------------

export class Assignment extends Schema.Class<Assignment>("Assignment")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  title: Schema.String,
  description: Schema.String,
  description_plaintext: Schema.String,
  state: AssignmentState,
  attachments: Schema.Array(Attachment),
  assignee_mode: AssignmentAssigneeMode,
  assignee_ids: Schema.Array(Schema.String),
  due_date: Schema.NullOr(Schema.String),
  display_date: Schema.NullOr(Schema.String),
  start_date: Schema.NullOr(Schema.String),
  end_date: Schema.NullOr(Schema.String),
  points_possible: Schema.Number,
  grading_type: Schema.String,
  submission_types: Schema.Array(Schema.String),
  max_attempts: Schema.Number,
  session_id: Schema.NullOr(Schema.String),
  category_id: Schema.NullOr(Schema.String),
}) {}
