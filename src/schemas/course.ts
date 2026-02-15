import { Schema } from "effect";
import { GradeLevel, Identifier, Subject } from "./common.js";

// ---------------------------------------------------------------------------
// Course — a course definition (template for classes)
// ---------------------------------------------------------------------------

export class Course extends Schema.Class<Course>("Course")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  identifiers: Schema.Array(Identifier),
  name: Schema.String,
  code: Schema.NullOr(Schema.String),
  subjects: Schema.Array(Subject),
  grade_levels: Schema.Array(GradeLevel),
  district_id: Schema.String,
  school_id: Schema.NullOr(Schema.String),
  session_id: Schema.NullOr(Schema.String),
}) {}
