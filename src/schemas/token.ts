import { Schema } from "effect";

// ---------------------------------------------------------------------------
// TokenResponse — data returned from OAuth grant / refresh
// ---------------------------------------------------------------------------

export class TokenResponse extends Schema.Class<TokenResponse>("TokenResponse")({
  access_token: Schema.String,
  refresh_token: Schema.String,
  expires_in: Schema.Number,
  token_type: Schema.String,
}) {}

// ---------------------------------------------------------------------------
// TokenData — enriched token with expiry timestamp for storage
// ---------------------------------------------------------------------------

export class TokenData extends Schema.Class<TokenData>("TokenData")({
  accessToken: Schema.String,
  refreshToken: Schema.String,
  /** Unix epoch (ms) when the access token expires */
  expiresAt: Schema.Number,
}) {}

// ---------------------------------------------------------------------------
// UserProfile — the authenticated user's profile from /v2/my/profile
// ---------------------------------------------------------------------------

export class UserProfile extends Schema.Class<UserProfile>("UserProfile")({
  id: Schema.String,
  email: Schema.NullOr(Schema.String),
  first_name: Schema.String,
  last_name: Schema.String,
  display_name: Schema.NullOr(Schema.String),
  locale: Schema.NullOr(Schema.String),
  time_zone: Schema.NullOr(Schema.String),
  picture_url: Schema.NullOr(Schema.String),
  created_date: Schema.String,
  updated_date: Schema.String,
}) {}
