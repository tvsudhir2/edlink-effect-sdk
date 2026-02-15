import { Schema } from "effect";

// ---------------------------------------------------------------------------
// License — product license allocation info
// ---------------------------------------------------------------------------

export class License extends Schema.Class<License>("License")({
  school_count: Schema.Number,
  class_count: Schema.Number,
  person_count: Schema.Number,
  integration_id: Schema.String,
  product_id: Schema.String,
}) {}
