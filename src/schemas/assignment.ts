import { Schema } from "effect";

import { Attachment } from "@/schemas/attachment.js";
import { AssignmentAssigneeMode, AssignmentState } from "@/schemas/common.js";

// ---------------------------------------------------------------------------
// Assignment — a task or activity assigned to students
// ---------------------------------------------------------------------------

export class Assignment extends Schema.Class<Assignment>("Assignment")({
  // --- ID fields ---
  assignee_ids: Schema.Array(Schema.String),
  category_id: Schema.NullOr(Schema.String),
  id: Schema.String,
  session_id: Schema.NullOr(Schema.String),

  // --- Other fields ---
  assignee_mode: AssignmentAssigneeMode,
  attachments: Schema.Array(Attachment),
  created_date: Schema.String,
  description: Schema.String,
  description_plaintext: Schema.String,
  display_date: Schema.NullOr(Schema.String),
  due_date: Schema.NullOr(Schema.String),
  end_date: Schema.NullOr(Schema.String),
  grading_type: Schema.String,
  max_attempts: Schema.Number,
  points_possible: Schema.Number,
  properties: Schema.Record(Schema.String, Schema.Unknown),
  start_date: Schema.NullOr(Schema.String),
  state: AssignmentState,
  submission_types: Schema.Array(Schema.String),
  title: Schema.String,
  updated_date: Schema.String,
}) {}
