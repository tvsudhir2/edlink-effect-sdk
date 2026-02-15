import { Schema } from "effect";
import { Identifier } from "./common.js";

// ---------------------------------------------------------------------------
// Category — a grade category within a class
// ---------------------------------------------------------------------------

export class Category extends Schema.Class<Category>("Category")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  identifiers: Schema.Array(Identifier),
  title: Schema.String,
  weight: Schema.Number,
  drop_lowest: Schema.Number,
  position: Schema.Number,
}) {}
