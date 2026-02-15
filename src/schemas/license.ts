import { Schema } from "effect";

// ---------------------------------------------------------------------------
// License — product license allocation info
// ---------------------------------------------------------------------------

export class License extends Schema.Class<License>("License")({
  // --- ID fields ---
  integration_id: Schema.String,
  product_id: Schema.String,

  // --- Other fields ---
  class_count: Schema.Number,
  person_count: Schema.Number,
  school_count: Schema.Number,
}) {}
