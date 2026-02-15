import { Schema } from "effect";
import { AgentRelationship, Identifier } from "./common.js";

// ---------------------------------------------------------------------------
// Agent — a relationship between two people (parent, guardian, aide)
// ---------------------------------------------------------------------------

export class Agent extends Schema.Class<Agent>("Agent")({
  id: Schema.String,
  created_date: Schema.String,
  updated_date: Schema.String,
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  identifiers: Schema.Array(Identifier),
  observer_id: Schema.String,
  target_id: Schema.String,
  relationship: AgentRelationship,
}) {}
