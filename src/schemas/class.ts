import { Schema } from "effect";

import { ClassState, GradeLevel, Identifier, Subject } from "@/schemas/common.js";
import { Product } from "@/schemas/product.js";

// ---------------------------------------------------------------------------
// EdlinkClass — a class within a school (named EdlinkClass to avoid JS reserved word)
// ---------------------------------------------------------------------------

export class EdlinkClass extends Schema.Class<EdlinkClass>("EdlinkClass")({
  // --- ID fields ---
  course_id: Schema.NullOr(Schema.String),
  id: Schema.String,
  product_ids: Schema.Array(Schema.String),
  school_id: Schema.String,
  session_ids: Schema.Array(Schema.String),

  // --- Other fields ---
  created_date: Schema.String,
  description: Schema.NullOr(Schema.String),
  grade_levels: Schema.Array(GradeLevel),
  identifiers: Schema.Array(Identifier),
  locale: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  periods: Schema.Array(Schema.String),
  picture_url: Schema.NullOr(Schema.String),
  products: Schema.optional(Schema.Array(Product)),
  properties: Schema.Record(Schema.String, Schema.Unknown),
  state: ClassState,
  subjects: Schema.Array(Subject),
  time_zone: Schema.NullOr(Schema.String),
  updated_date: Schema.String,
}) {}
