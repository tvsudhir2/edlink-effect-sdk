import { Schema } from "effect";
import { Gender, Race, ResidenceStatus } from "@/schemas/common.js";

// ---------------------------------------------------------------------------
// Demographics — demographic data attached to a Person
// ---------------------------------------------------------------------------

export class Demographics extends Schema.Class<Demographics>("Demographics")({
  // --- Other fields ---
  birthday: Schema.NullOr(Schema.String),
  city_of_birth: Schema.NullOr(Schema.String),
  country_of_birth: Schema.NullOr(Schema.String),
  disability: Schema.NullOr(Schema.Unknown),
  economically_disadvantaged: Schema.NullOr(Schema.Boolean),
  english_language_learner: Schema.NullOr(Schema.Boolean),
  food_service_program_eligibility: Schema.NullOr(Schema.Unknown),
  gender: Schema.optional(Gender),
  gifted_talented: Schema.NullOr(Schema.Boolean),
  hispanic_or_latino_ethnicity: Schema.NullOr(Schema.Boolean),
  homeless: Schema.NullOr(Schema.Boolean),
  individualized_educationPlan: Schema.NullOr(Schema.Boolean),
  migrant: Schema.NullOr(Schema.Boolean),
  public_assistance: Schema.NullOr(Schema.Boolean),
  races: Schema.optional(Race),
  residence_status: Schema.optional(ResidenceStatus),
  rural_residency: Schema.NullOr(Schema.Boolean),
  state_of_birth: Schema.NullOr(Schema.String),
}) {}
