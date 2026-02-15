import { Schema } from "effect";
import { ProductState } from "./common.js";

// ---------------------------------------------------------------------------
// Product — Edlink product / application metadata
// ---------------------------------------------------------------------------

export class Product extends Schema.Class<Product>("Product")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  name: Schema.String,
  code: Schema.String,
  picture_url: Schema.String,
  description: Schema.String,
  state: ProductState,
  team_id: Schema.String,
  soft_cap: Schema.optional(Schema.Number),
  hard_cap: Schema.optional(Schema.Number),
  tags: Schema.Array(Schema.String),
  license_duration: Schema.Number,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
}) {}
