import { Schema } from "effect";
import { GradeLevel, Identifier, Role } from "./common.js";
import { Demographics } from "./demographics.js";
import { Product } from "./product.js";

// ---------------------------------------------------------------------------
// Person — a student, teacher, administrator, or other individual
// ---------------------------------------------------------------------------

export class Person extends Schema.Class<Person>("Person")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  identifiers: Schema.Array(Identifier),
  first_name: Schema.NullOr(Schema.String),
  middle_name: Schema.NullOr(Schema.String),
  last_name: Schema.NullOr(Schema.String),
  display_name: Schema.NullOr(Schema.String),
  picture_url: Schema.NullOr(Schema.String),
  roles: Schema.Array(Role),
  email: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String),
  locale: Schema.NullOr(Schema.String),
  time_zone: Schema.NullOr(Schema.String),
  graduation_year: Schema.NullOr(Schema.Number),
  grade_levels: Schema.Array(GradeLevel),
  demographics: Schema.optional(Demographics),
  district_id: Schema.String,
  school_ids: Schema.Array(Schema.String),
  product_ids: Schema.Array(Schema.String),
  products: Schema.optional(Schema.Array(Product)),
}) {}
