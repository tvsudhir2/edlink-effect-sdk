import { Schema } from "effect";
import { GradeLevel, Identifier, Subject } from "@/schemas/common.js";

// ---------------------------------------------------------------------------
// Course — a course definition (template for classes)
// ---------------------------------------------------------------------------

export class Course extends Schema.Class<Course>("Course")({
  // --- ID fields ---
  district_id: Schema.String,
  id: Schema.String,
  school_id: Schema.NullOr(Schema.String),
  session_id: Schema.NullOr(Schema.String),

  // --- Other fields ---
  code: Schema.NullOr(Schema.String),
  created_date: Schema.String,
  grade_levels: Schema.Array(GradeLevel),
  identifiers: Schema.Array(Identifier),
  name: Schema.String,
  properties: Schema.Record(Schema.String, Schema.Unknown),
  subjects: Schema.Array(Subject),
  updated_date: Schema.String,
}) {}
