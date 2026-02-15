import { Schema } from "effect";
import { Identifier, SessionState, SessionType } from "./common.js";

// ---------------------------------------------------------------------------
// Session — a time period (semester, term, school year, etc.)
// ---------------------------------------------------------------------------

export class Session extends Schema.Class<Session>("Session")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  identifiers: Schema.Array(Identifier),
  name: Schema.String,
  type: SessionType,
  state: SessionState,
  start_date: Schema.NullOr(Schema.String),
  end_date: Schema.NullOr(Schema.String),
  school_id: Schema.NullOr(Schema.String),
  district_id: Schema.String,
}) {}
