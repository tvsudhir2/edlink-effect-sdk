import { Schema } from "effect";

// ---------------------------------------------------------------------------
// Address — physical location for schools and districts
// ---------------------------------------------------------------------------

export class Address extends Schema.Class<Address>("Address")({
  street: Schema.NullOr(Schema.String),
  unit: Schema.NullOr(Schema.String),
  postal_code: Schema.NullOr(Schema.String),
  city: Schema.NullOr(Schema.String),
  state: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String),
  latitude: Schema.NullOr(Schema.Number),
  longitude: Schema.NullOr(Schema.Number),
}) {}
