import { Schema } from "effect";
import { Identifier, SectionState } from "@/schemas/common.js";

// ---------------------------------------------------------------------------
// Section — a subdivision within a class
// ---------------------------------------------------------------------------

export class Section extends Schema.Class<Section>("Section")({
  // --- ID fields ---
  class_id: Schema.String,
  id: Schema.String,

  // --- Other fields ---
  created_date: Schema.String,
  description: Schema.NullOr(Schema.String),
  identifiers: Schema.Array(Identifier),
  locale: Schema.NullOr(Schema.String),
  name: Schema.String,
  periods: Schema.Array(Schema.String),
  picture_url: Schema.NullOr(Schema.String),
  properties: Schema.Record(Schema.String, Schema.Unknown),
  state: SectionState,
  time_zone: Schema.NullOr(Schema.String),
  updated_date: Schema.String,
}) {}
