import { Schema } from "effect";
import { EnrollmentState, Identifier, Role } from "./common.js";

// ---------------------------------------------------------------------------
// Enrollment — a person's association with a class
// ---------------------------------------------------------------------------

export class Enrollment extends Schema.Class<Enrollment>("Enrollment")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  identifiers: Schema.Array(Identifier),
  state: EnrollmentState,
  role: Role,
  start_date: Schema.NullOr(Schema.String),
  end_date: Schema.NullOr(Schema.String),
  primary: Schema.NullOr(Schema.Boolean),
  person_id: Schema.String,
  class_id: Schema.String,
  section_id: Schema.NullOr(Schema.String),
}) {}
