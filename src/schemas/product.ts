import { Schema } from "effect";

import { ProductState } from "@/schemas/common.js";

// ---------------------------------------------------------------------------
// Product — Edlink product / application metadata
// ---------------------------------------------------------------------------

export class Product extends Schema.Class<Product>("Product")({
  // --- ID fields ---
  id: Schema.String,
  team_id: Schema.String,

  // --- Other fields ---
  code: Schema.String,
  created_date: Schema.String,
  description: Schema.String,
  hard_cap: Schema.optional(Schema.Number),
  license_duration: Schema.Number,
  name: Schema.String,
  picture_url: Schema.String,
  properties: Schema.Record(Schema.String, Schema.Unknown),
  soft_cap: Schema.optional(Schema.Number),
  state: ProductState,
  tags: Schema.Array(Schema.String),
  updated_date: Schema.String,
}) {}
