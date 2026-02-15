import { Schema } from "effect";

// ---------------------------------------------------------------------------
// EdlinkEvent — runtime-validated schema for Edlink Graph API events
// ---------------------------------------------------------------------------

/** Named Schema.Class so tooltips show `EdlinkEvent` instead of inline object. */
export class EdlinkEvent extends Schema.Class<EdlinkEvent>("EdlinkEvent")({
  id: Schema.String,
  type: Schema.String,
  target: Schema.optional(Schema.String),
  target_id: Schema.optional(Schema.String),
  integration_id: Schema.optional(Schema.String),
  materialization_id: Schema.optional(Schema.String),
  date: Schema.optional(Schema.String),
  data: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  properties: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  created_date: Schema.optional(Schema.String),
  updated_date: Schema.optional(Schema.String),
}) {}

/** Schema constant for use with decoders — same schema, re-exported for convenience */
export const EdlinkEventSchema = EdlinkEvent;
