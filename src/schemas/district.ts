import { Schema } from "effect";
import { Identifier } from "./common.js";
import { Address } from "./address.js";

// ---------------------------------------------------------------------------
// District — top-level organizational unit
// ---------------------------------------------------------------------------

export class District extends Schema.Class<District>("District")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  identifiers: Schema.Array(Identifier),
  name: Schema.String,
  picture_url: Schema.NullOr(Schema.String),
  locale: Schema.NullOr(Schema.String),
  address: Schema.NullOr(Address),
  time_zone: Schema.NullOr(Schema.String),
}) {}
