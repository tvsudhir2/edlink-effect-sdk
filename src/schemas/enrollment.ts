import { Schema } from "effect";
import { EnrollmentState, Identifier, Role } from "./common.js";

// ---------------------------------------------------------------------------
// Enrollment — a person's association with a class
// ---------------------------------------------------------------------------

export class Enrollment extends Schema.Class<Enrollment>("Enrollment")({
  // --- ID fields ---
  class_id: Schema.String,
  id: Schema.String,
  person_id: Schema.String,
  section_id: Schema.NullOr(Schema.String),

  // --- Other fields ---
  created_date: Schema.String,
  end_date: Schema.NullOr(Schema.String),
  identifiers: Schema.Array(Identifier),
  primary: Schema.NullOr(Schema.Boolean),
  properties: Schema.Record(Schema.String, Schema.Unknown),
  role: Role,
  start_date: Schema.NullOr(Schema.String),
  state: EnrollmentState,
  updated_date: Schema.String,
}) {}
