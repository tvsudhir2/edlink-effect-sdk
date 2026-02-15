import { Config, Context, Layer, Secret } from "effect";

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

/** Type-safe Edlink configuration — no clientId needed, auth is bearer-only */
export interface EdlinkConfigData {
  readonly clientSecret: Secret.Secret;
  readonly apiBaseUrl: string;
  readonly defaultMaxPages: number;
}

// ---------------------------------------------------------------------------
// Service tag
// ---------------------------------------------------------------------------

/**
 * Injectable configuration dependency.
 *
 * `EdlinkConfig.Live` reads from environment variables that are loaded via
 * `tsx --env-file=.env.local` — zero `process.env` usage in the codebase.
 */
export class EdlinkConfig extends Context.Tag("EdlinkConfig")<
  EdlinkConfig,
  EdlinkConfigData
>() {
  static readonly Live = Layer.effect(
    EdlinkConfig,
    Config.all({
      clientSecret: Config.secret("EDLINK_CLIENT_SECRET"),
      apiBaseUrl: Config.string("EDLINK_API_BASE_URL").pipe(
        Config.withDefault("https://ed.link/api"),
      ),
      defaultMaxPages: Config.integer("EDLINK_DEFAULT_MAX_PAGES").pipe(
        Config.withDefault(3),
      ),
    }),
  );
}
