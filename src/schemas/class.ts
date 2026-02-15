import { Schema } from "effect";
import { ClassState, GradeLevel, Identifier, Subject } from "./common.js";
import { Product } from "./product.js";

// ---------------------------------------------------------------------------
// EdlinkClass — a class within a school (named EdlinkClass to avoid JS reserved word)
// ---------------------------------------------------------------------------

export class EdlinkClass extends Schema.Class<EdlinkClass>("EdlinkClass")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  identifiers: Schema.Array(Identifier),
  name: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  picture_url: Schema.NullOr(Schema.String),
  locale: Schema.NullOr(Schema.String),
  time_zone: Schema.NullOr(Schema.String),
  subjects: Schema.Array(Subject),
  grade_levels: Schema.Array(GradeLevel),
  periods: Schema.Array(Schema.String),
  state: ClassState,
  session_ids: Schema.Array(Schema.String),
  course_id: Schema.NullOr(Schema.String),
  school_id: Schema.String,
  product_ids: Schema.Array(Schema.String),
  products: Schema.optional(Schema.Array(Product)),
}) {}
