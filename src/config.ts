import { Config, Effect, Layer, type Redacted, ServiceMap } from "effect";

// ---------------------------------------------------------------------------
// Graph API configuration
// ---------------------------------------------------------------------------

/** Type-safe Edlink configuration — no clientId needed, auth is bearer-only */
export interface EdlinkConfigData {
  readonly clientSecret: Redacted.Redacted;
  readonly apiBaseUrl: string;
  readonly defaultMaxPages: number;
}

/**
 * Injectable configuration dependency for the Graph API.
 *
 * `EdlinkConfig.Live` reads from environment variables that are loaded via
 * `tsx --env-file=.env.local` — zero `process.env` usage in the codebase.
 */
export class EdlinkConfig extends ServiceMap.Service<EdlinkConfig, EdlinkConfigData>()("EdlinkConfig") {
  static readonly Live = Layer.effect(
    EdlinkConfig,
    Effect.gen(function* () {
      return yield* Config.all({
        clientSecret: Config.redacted("EDLINK_CLIENT_SECRET"),
        apiBaseUrl: Config.string("EDLINK_API_BASE_URL").pipe(Config.withDefault(() => "https://ed.link/api")),
        defaultMaxPages: Config.int("EDLINK_DEFAULT_MAX_PAGES").pipe(Config.withDefault(() => 3)),
      });
    }),
  );
}

// ---------------------------------------------------------------------------
// User API configuration (OAuth)
// ---------------------------------------------------------------------------

/** Configuration for the Edlink User API — OAuth2 authorization code flow */
export interface EdlinkUserConfigData {
  readonly clientId: string;
  readonly clientSecret: Redacted.Redacted;
  readonly redirectUri: string;
  readonly apiBaseUrl: string;
}

/**
 * Injectable configuration dependency for the User API.
 *
 * Requires `EDLINK_CLIENT_ID` and `EDLINK_REDIRECT_URI` env vars in addition
 * to the shared `EDLINK_CLIENT_SECRET`.
 */
export class EdlinkUserConfig extends ServiceMap.Service<EdlinkUserConfig, EdlinkUserConfigData>()("EdlinkUserConfig") {
  static readonly Live = Layer.effect(
    EdlinkUserConfig,
    Effect.gen(function* () {
      return yield* Config.all({
        clientId: Config.string("EDLINK_CLIENT_ID"),
        clientSecret: Config.redacted("EDLINK_CLIENT_SECRET"),
        redirectUri: Config.string("EDLINK_REDIRECT_URI"),
        apiBaseUrl: Config.string("EDLINK_API_BASE_URL").pipe(Config.withDefault(() => "https://ed.link/api")),
      });
    }),
  );
}
