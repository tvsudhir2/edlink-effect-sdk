import { Effect, Redacted, Schema } from "effect";
import { type HttpBody, HttpClient, HttpClientRequest } from "effect/unstable/http";
import type { EdlinkUserConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import { TokenResponse } from "../../schemas/token.js";

// ---------------------------------------------------------------------------
// Shared context for user-level API calls
// ---------------------------------------------------------------------------

/**
 * Bundles the user-level config and HTTP client needed by OAuth / profile calls.
 */
export interface UserRequestContext {
  readonly config: EdlinkUserConfigData;
  readonly httpClient: HttpClient.HttpClient;
}

// ---------------------------------------------------------------------------
// Authorization URL builder
// ---------------------------------------------------------------------------

/**
 * Options for building the OAuth2 authorization URL.
 */
export interface AuthorizationUrlOptions {
  readonly scopes?: readonly string[];
  readonly state?: string | undefined;
}

/**
 * Build the Edlink OAuth2 authorization URL.
 *
 * Redirect the user's browser to this URL to start the consent flow.
 */
export const buildAuthorizationUrl = (options: AuthorizationUrlOptions, config: EdlinkUserConfigData): string => {
  const scopes = options.scopes ?? [];
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
  });

  if (scopes.length > 0) {
    params.set("scope", scopes.join(" "));
  }
  if (options.state) {
    params.set("state", options.state);
  }

  return `${config.apiBaseUrl}/authentication/authorize?${params.toString()}`;
};

// ---------------------------------------------------------------------------
// Token response schema wrapper
// ---------------------------------------------------------------------------

const TokenResponseWrapper = Schema.Struct({
  $data: TokenResponse,
});

// ---------------------------------------------------------------------------
// Exchange authorization code for tokens
// ---------------------------------------------------------------------------

/**
 * Exchange an authorization code for access + refresh tokens.
 *
 * POST `/v2/authentication/token` with `grant_type=authorization_code`.
 */
export const exchangeCode = (
  code: string,
  ctx: UserRequestContext,
): Effect.Effect<TokenResponse, EdlinkApiError | EdlinkDecodeError> => {
  const client = ctx.httpClient.pipe(HttpClient.filterStatusOk);
  const decode = Schema.decodeUnknownEffect(TokenResponseWrapper);

  return Effect.gen(function* () {
    const url = `${ctx.config.apiBaseUrl}/v2/authentication/token`;

    const request = HttpClientRequest.post(url).pipe(
      HttpClientRequest.bodyJson({
        grant_type: "authorization_code",
        code,
        client_id: ctx.config.clientId,
        client_secret: Redacted.value(ctx.config.clientSecret),
        redirect_uri: ctx.config.redirectUri,
      }),
    );

    const preparedRequest = yield* Effect.isEffect(request)
      ? (request as Effect.Effect<HttpClientRequest.HttpClientRequest, HttpBody.HttpBodyError>).pipe(
          Effect.mapError(
            (err) => new EdlinkApiError({ message: `Failed to encode request body: ${String(err)}`, cause: err }),
          ),
        )
      : Effect.succeed(request as HttpClientRequest.HttpClientRequest);

    const response = yield* client.execute(preparedRequest).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `OAuth code exchange failed: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const raw = yield* response.json.pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `Failed to parse token response: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const result = yield* decode(raw).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkDecodeError({
            message: `Token response schema mismatch: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    return result.$data;
  });
};

// ---------------------------------------------------------------------------
// Refresh an access token
// ---------------------------------------------------------------------------

/**
 * Refresh an expired access token using a refresh token.
 *
 * POST `/v2/authentication/token` with `grant_type=refresh_token`.
 */
export const refreshToken = (
  refreshTokenValue: string,
  ctx: UserRequestContext,
): Effect.Effect<TokenResponse, EdlinkApiError | EdlinkDecodeError> => {
  const client = ctx.httpClient.pipe(HttpClient.filterStatusOk);
  const decode = Schema.decodeUnknownEffect(TokenResponseWrapper);

  return Effect.gen(function* () {
    const url = `${ctx.config.apiBaseUrl}/v2/authentication/token`;

    const request = HttpClientRequest.post(url).pipe(
      HttpClientRequest.bodyJson({
        grant_type: "refresh_token",
        refresh_token: refreshTokenValue,
        client_id: ctx.config.clientId,
        client_secret: Redacted.value(ctx.config.clientSecret),
      }),
    );

    const preparedRequest = yield* Effect.isEffect(request)
      ? (request as Effect.Effect<HttpClientRequest.HttpClientRequest, HttpBody.HttpBodyError>).pipe(
          Effect.mapError(
            (err) => new EdlinkApiError({ message: `Failed to encode request body: ${String(err)}`, cause: err }),
          ),
        )
      : Effect.succeed(request as HttpClientRequest.HttpClientRequest);

    const response = yield* client.execute(preparedRequest).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `OAuth token refresh failed: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const raw = yield* response.json.pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `Failed to parse token response: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const result = yield* decode(raw).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkDecodeError({
            message: `Token response schema mismatch: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    return result.$data;
  });
};
