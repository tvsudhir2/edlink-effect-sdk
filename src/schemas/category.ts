import { Schema } from "effect";
import { Identifier } from "./common.js";

// ---------------------------------------------------------------------------
// Category — a grade category within a class
// ---------------------------------------------------------------------------

export class Category extends Schema.Class<Category>("Category")({
  // --- ID fields ---
  id: Schema.String,

  // --- Other fields ---
  created_date: Schema.String,
  drop_lowest: Schema.Number,
  identifiers: Schema.Array(Identifier),
  position: Schema.Number,
  properties: Schema.Record(Schema.String, Schema.Unknown),
  title: Schema.String,
  updated_date: Schema.String,
  weight: Schema.Number,
}) {}
