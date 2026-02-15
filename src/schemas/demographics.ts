import { Schema } from "effect";
import { Gender, Race, ResidenceStatus } from "./common.js";

// ---------------------------------------------------------------------------
// Demographics — demographic data attached to a Person
// ---------------------------------------------------------------------------

export class Demographics extends Schema.Class<Demographics>("Demographics")({
  birthday: Schema.NullOr(Schema.String),
  gender: Schema.optional(Gender),
  residence_status: Schema.optional(ResidenceStatus),
  english_language_learner: Schema.NullOr(Schema.Boolean),
  country_of_birth: Schema.NullOr(Schema.String),
  state_of_birth: Schema.NullOr(Schema.String),
  city_of_birth: Schema.NullOr(Schema.String),
  hispanic_or_latino_ethnicity: Schema.NullOr(Schema.Boolean),
  races: Schema.optional(Race),
  homeless: Schema.NullOr(Schema.Boolean),
  disability: Schema.NullOr(Schema.Unknown),
  gifted_talented: Schema.NullOr(Schema.Boolean),
  food_service_program_eligibility: Schema.NullOr(Schema.Unknown),
  economically_disadvantaged: Schema.NullOr(Schema.Boolean),
  migrant: Schema.NullOr(Schema.Boolean),
  public_assistance: Schema.NullOr(Schema.Boolean),
  rural_residency: Schema.NullOr(Schema.Boolean),
  individualized_educationPlan: Schema.NullOr(Schema.Boolean),
}) {}
