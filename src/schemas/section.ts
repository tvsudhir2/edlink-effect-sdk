import { Schema } from "effect";
import { Identifier, SectionState } from "./common.js";

// ---------------------------------------------------------------------------
// Section — a subdivision within a class
// ---------------------------------------------------------------------------

export class Section extends Schema.Class<Section>("Section")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  identifiers: Schema.Array(Identifier),
  name: Schema.String,
  picture_url: Schema.NullOr(Schema.String),
  locale: Schema.NullOr(Schema.String),
  time_zone: Schema.NullOr(Schema.String),
  state: SectionState,
  description: Schema.NullOr(Schema.String),
  periods: Schema.Array(Schema.String),
  class_id: Schema.String,
}) {}
