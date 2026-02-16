import { Schema } from "effect";
import { Address } from "./address.js";
import { Identifier } from "./common.js";

// ---------------------------------------------------------------------------
// District — top-level organizational unit
// ---------------------------------------------------------------------------

export class District extends Schema.Class<District>("District")({
  // --- ID fields ---
  id: Schema.String,

  // --- Other fields ---
  address: Schema.NullOr(Address),
  created_date: Schema.String,
  identifiers: Schema.Array(Identifier),
  locale: Schema.NullOr(Schema.String),
  name: Schema.String,
  picture_url: Schema.NullOr(Schema.String),
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  time_zone: Schema.NullOr(Schema.String),
  updated_date: Schema.String,
}) {}
