import { Schema } from "effect";

import { AgentRelationship, Identifier } from "@/schemas/common.js";

// ---------------------------------------------------------------------------
// Agent — a relationship between two people (parent, guardian, aide)
// ---------------------------------------------------------------------------

export class Agent extends Schema.Class<Agent>("Agent")({
  // --- ID fields ---
  id: Schema.String,
  observer_id: Schema.String,
  target_id: Schema.String,

  // --- Other fields ---
  created_date: Schema.String,
  identifiers: Schema.Array(Identifier),
  properties: Schema.Record(Schema.String, Schema.Unknown),
  relationship: AgentRelationship,
  updated_date: Schema.String,
}) {}
