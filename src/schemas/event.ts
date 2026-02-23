import { Schema } from "effect";

// ---------------------------------------------------------------------------
// EdlinkEvent — runtime-validated schema for Edlink Graph API events
// ---------------------------------------------------------------------------

/** Named Schema.Class so tooltips show `EdlinkEvent` instead of inline object. */
export class EdlinkEvent extends Schema.Class<EdlinkEvent>("EdlinkEvent")({
  // --- ID fields ---
  id: Schema.String,
  integration_id: Schema.optional(Schema.String),
  materialization_id: Schema.optional(Schema.String),
  target_id: Schema.optional(Schema.String),

  // --- Other fields ---
  created_date: Schema.optional(Schema.String),
  data: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
  date: Schema.optional(Schema.String),
  properties: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
  target: Schema.optional(Schema.String),
  type: Schema.String,
  updated_date: Schema.optional(Schema.String),
}) {}

/** Schema constant for use with decoders — same schema, re-exported for convenience */
export const EdlinkEventSchema = EdlinkEvent;
