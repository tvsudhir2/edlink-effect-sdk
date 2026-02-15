import { Schema } from "effect";
import { AttachmentType } from "./common.js";

// ---------------------------------------------------------------------------
// Attachment — file/link/text attached to assignments or submissions
// ---------------------------------------------------------------------------

export class Attachment extends Schema.Class<Attachment>("Attachment")({
  type: AttachmentType,
  text: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  url: Schema.optional(Schema.String),
  file_external_id: Schema.optional(Schema.String),
  size: Schema.optional(Schema.Number),
}) {}
