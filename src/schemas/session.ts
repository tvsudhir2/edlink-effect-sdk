import { Schema } from "effect";
import { Identifier, SessionState, SessionType } from "./common.js";

// ---------------------------------------------------------------------------
// Session — a time period (semester, term, school year, etc.)
// ---------------------------------------------------------------------------

export class Session extends Schema.Class<Session>("Session")({
  // --- ID fields ---
  district_id: Schema.String,
  id: Schema.String,
  school_id: Schema.NullOr(Schema.String),

  // --- Other fields ---
  created_date: Schema.String,
  end_date: Schema.NullOr(Schema.String),
  identifiers: Schema.Array(Identifier),
  name: Schema.String,
  properties: Schema.Record(Schema.String, Schema.Unknown),
  start_date: Schema.NullOr(Schema.String),
  state: SessionState,
  type: SessionType,
  updated_date: Schema.String,
}) {}
