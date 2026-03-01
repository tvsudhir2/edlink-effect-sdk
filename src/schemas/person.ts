import { Schema } from "effect";
import { GradeLevel, Identifier, Role } from "@/schemas/common.js";
import { Demographics } from "@/schemas/demographics.js";
import { Product } from "@/schemas/product.js";

// ---------------------------------------------------------------------------
// Person — a student, teacher, administrator, or other individual
// ---------------------------------------------------------------------------

export class Person extends Schema.Class<Person>("Person")({
  // --- ID fields ---
  district_id: Schema.String,
  id: Schema.String,
  product_ids: Schema.Array(Schema.String),
  school_ids: Schema.Array(Schema.String),

  // --- Other fields ---
  created_date: Schema.String,
  demographics: Schema.optional(Demographics),
  display_name: Schema.NullOr(Schema.String),
  email: Schema.NullOr(Schema.String),
  first_name: Schema.NullOr(Schema.String),
  grade_levels: Schema.Array(GradeLevel),
  graduation_year: Schema.NullOr(Schema.Number),
  identifiers: Schema.Array(Identifier),
  last_name: Schema.NullOr(Schema.String),
  locale: Schema.NullOr(Schema.String),
  middle_name: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String),
  picture_url: Schema.NullOr(Schema.String),
  products: Schema.optional(Schema.Array(Product)),
  properties: Schema.Record(Schema.String, Schema.Unknown),
  roles: Schema.Array(Role),
  time_zone: Schema.NullOr(Schema.String),
  updated_date: Schema.String,
}) {}
