import { Schema } from "effect";
import { GradeLevel, Identifier } from "./common.js";
import { Address } from "./address.js";
import { Product } from "./product.js";

// ---------------------------------------------------------------------------
// School — an educational institution within a district
// ---------------------------------------------------------------------------

export class School extends Schema.Class<School>("School")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  identifiers: Schema.Array(Identifier),
  name: Schema.String,
  picture_url: Schema.NullOr(Schema.String),
  locale: Schema.NullOr(Schema.String),
  address: Schema.NullOr(Address),
  time_zone: Schema.NullOr(Schema.String),
  grade_levels: Schema.Array(GradeLevel),
  district_id: Schema.String,
  product_ids: Schema.Array(Schema.String),
  products: Schema.optional(Schema.Array(Product)),
}) {}
