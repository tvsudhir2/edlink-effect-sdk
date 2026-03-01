import { Schema } from "effect";

import { AttachmentType } from "@/schemas/common.js";

// ---------------------------------------------------------------------------
// Attachment — file/link/text attached to assignments or submissions
// ---------------------------------------------------------------------------

export class Attachment extends Schema.Class<Attachment>("Attachment")({
  // --- ID fields ---
  file_external_id: Schema.optional(Schema.String),

  // --- Other fields ---
  description: Schema.optional(Schema.String),
  size: Schema.optional(Schema.Number),
  text: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
  type: AttachmentType,
  url: Schema.optional(Schema.String),
}) {}
