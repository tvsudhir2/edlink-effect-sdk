import { Effect, Layer, Option, ServiceMap } from "effect";
import { HttpClient } from "effect/unstable/http";
import type { UserRequestContext } from "@/api/v2/oauth.js";
import * as OAuth from "@/api/v2/oauth.js";
import * as ProfileApi from "@/api/v2/profile.js";
import { EdlinkUserConfig } from "@/config.js";
import { EdlinkApiError, type EdlinkDecodeError } from "@/errors.js";
import type { TokenResponse, UserProfile } from "@/schemas/token.js";
import { TokenData } from "@/schemas/token.js";
import { TokenStore } from "@/token-store.js";

// ---------------------------------------------------------------------------
// Error union shorthand
// ---------------------------------------------------------------------------

type ApiErrors = EdlinkApiError | EdlinkDecodeError;

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

/**
 * Edlink User API Client — OAuth2 flow + per-user token management.
 *
 * Handles authorization code exchange, token refresh, profile fetching,
 * and automatic token lifecycle management via a pluggable `TokenStore`.
 */
export class EdlinkUserClient extends ServiceMap.Service<
  EdlinkUserClient,
  {
    /**
     * Build the OAuth2 authorization URL.
     * Redirect the user's browser to this URL to start consent.
     */
    readonly authorize: (scopes?: readonly string[], state?: string) => string;

    /**
     * Exchange an authorization code for tokens and store them.
     * Returns the token response containing access + refresh tokens.
     */
    readonly handleCallback: (code: string) => Effect.Effect<TokenResponse, ApiErrors>;

    /**
     * Get the current access token for a user, refreshing if expired.
     * Returns `None` if no tokens are stored for the user.
     */
    readonly getAccessToken: (userId: string) => Effect.Effect<Option.Option<string>, ApiErrors>;

    /**
     * Fetch the authenticated user's profile.
     * Automatically manages token refresh if the access token has expired.
     */
    readonly getProfile: (userId: string) => Effect.Effect<UserProfile, ApiErrors>;

    /**
     * Store tokens for a user (useful for restoring sessions).
     */
    readonly storeTokens: (userId: string, tokenData: TokenData) => Effect.Effect<void>;

    /**
     * Remove stored tokens for a user (logout / revoke).
     */
    readonly removeTokens: (userId: string) => Effect.Effect<void>;
  }
>()("EdlinkUserClient") {}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/** Buffer (ms) before expiry to trigger a proactive refresh. */
const EXPIRY_BUFFER_MS = 60_000; // 1 minute

const tokenDataFromResponse = (response: TokenResponse): TokenData =>
  new TokenData({
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: Date.now() + response.expires_in * 1000,
  });

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

const makeEdlinkUserClient = Effect.gen(function* () {
  const userConfig = yield* EdlinkUserConfig;
  const httpClient = yield* HttpClient.HttpClient;
  const tokenStore = yield* TokenStore;

  const userCtx: UserRequestContext = { config: userConfig, httpClient };

  /**
   * Get a valid access token for a user, refreshing if needed.
   * Returns None if no tokens stored.
   */
  const getValidToken = (userId: string): Effect.Effect<Option.Option<string>, ApiErrors> =>
    Effect.gen(function* () {
      const maybeToken = yield* tokenStore.get(userId);

      if (Option.isNone(maybeToken)) {
        return Option.none<string>();
      }

      const stored = maybeToken.value;

      // Token still valid
      if (stored.expiresAt > Date.now() + EXPIRY_BUFFER_MS) {
        return Option.some(stored.accessToken);
      }

      // Token expired or about to expire — refresh
      const refreshed = yield* OAuth.refreshToken(stored.refreshToken, userCtx);
      const newTokenData = tokenDataFromResponse(refreshed);
      yield* tokenStore.set(userId, newTokenData);

      return Option.some(newTokenData.accessToken);
    });

  return {
    authorize: (scopes?: readonly string[], state?: string) =>
      OAuth.buildAuthorizationUrl({ scopes: scopes ?? [], state }, userConfig),

    handleCallback: (code: string) =>
      Effect.gen(function* () {
        const tokenResponse = yield* OAuth.exchangeCode(code, userCtx);

        // Extract user ID from profile to key the token store
        const profile = yield* ProfileApi.fetchMyProfile(tokenResponse.access_token, userCtx);

        const tokenData = tokenDataFromResponse(tokenResponse);
        yield* tokenStore.set(profile.id, tokenData);

        return tokenResponse;
      }),

    getAccessToken: (userId: string) => getValidToken(userId),

    getProfile: (userId: string) =>
      Effect.gen(function* () {
        const maybeToken = yield* getValidToken(userId);

        if (Option.isNone(maybeToken)) {
          return yield* new EdlinkApiError({
            message: `No tokens stored for user ${userId}. Call handleCallback() first.`,
          });
        }

        return yield* ProfileApi.fetchMyProfile(maybeToken.value, userCtx);
      }),

    storeTokens: (userId: string, tokenData: TokenData) => tokenStore.set(userId, tokenData),

    removeTokens: (userId: string) => tokenStore.delete(userId),
  };
});

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

/** Live layer — requires `EdlinkUserConfig`, `HttpClient`, and `TokenStore` */
export const EdlinkUserClientLive: Layer.Layer<
  EdlinkUserClient,
  never,
  EdlinkUserConfig | HttpClient.HttpClient | TokenStore
> = Layer.effect(EdlinkUserClient, makeEdlinkUserClient);
