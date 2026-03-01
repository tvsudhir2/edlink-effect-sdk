import { Schema } from "effect";
import { Address } from "@/schemas/address.js";
import { GradeLevel, Identifier } from "@/schemas/common.js";
import { Product } from "@/schemas/product.js";

// ---------------------------------------------------------------------------
// School — an educational institution within a district
// ---------------------------------------------------------------------------

export class School extends Schema.Class<School>("School")({
  // --- ID fields ---
  district_id: Schema.String,
  id: Schema.String,
  product_ids: Schema.Array(Schema.String),

  // --- Other fields ---
  address: Schema.NullOr(Address),
  created_date: Schema.String,
  grade_levels: Schema.Array(GradeLevel),
  identifiers: Schema.Array(Identifier),
  locale: Schema.NullOr(Schema.String),
  name: Schema.String,
  picture_url: Schema.NullOr(Schema.String),
  products: Schema.optional(Schema.Array(Product)),
  properties: Schema.Record(Schema.String, Schema.Unknown),
  time_zone: Schema.NullOr(Schema.String),
  updated_date: Schema.String,
}) {}
