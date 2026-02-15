import { Effect, Secret, Schema } from "effect";
import { HttpClient, HttpClientRequest, HttpBody } from "@effect/platform";
import type { EdlinkUserConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import { TokenResponse } from "../../schemas/token.js";

// ---------------------------------------------------------------------------
// Authorization URL builder
// ---------------------------------------------------------------------------

/**
 * Build the Edlink OAuth2 authorization URL.
 *
 * Redirect the user's browser to this URL to start the consent flow.
 */
export const buildAuthorizationUrl = (
  config: EdlinkUserConfigData,
  scopes: readonly string[] = [],
  state?: string,
): string => {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
  });

  if (scopes.length > 0) {
    params.set("scope", scopes.join(" "));
  }
  if (state) {
    params.set("state", state);
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
  config: EdlinkUserConfigData,
  httpClient: HttpClient.HttpClient,
  code: string,
): Effect.Effect<TokenResponse, EdlinkApiError | EdlinkDecodeError> => {
  const client = httpClient.pipe(HttpClient.filterStatusOk);
  const decode = Schema.decodeUnknown(TokenResponseWrapper);

  return Effect.gen(function* () {
    const url = `${config.apiBaseUrl}/v2/authentication/token`;

    const request = HttpClientRequest.post(url).pipe(
      HttpClientRequest.bodyJson({
        grant_type: "authorization_code",
        code,
        client_id: config.clientId,
        client_secret: Secret.value(config.clientSecret),
        redirect_uri: config.redirectUri,
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
  config: EdlinkUserConfigData,
  httpClient: HttpClient.HttpClient,
  refreshTokenValue: string,
): Effect.Effect<TokenResponse, EdlinkApiError | EdlinkDecodeError> => {
  const client = httpClient.pipe(HttpClient.filterStatusOk);
  const decode = Schema.decodeUnknown(TokenResponseWrapper);

  return Effect.gen(function* () {
    const url = `${config.apiBaseUrl}/v2/authentication/token`;

    const request = HttpClientRequest.post(url).pipe(
      HttpClientRequest.bodyJson({
        grant_type: "refresh_token",
        refresh_token: refreshTokenValue,
        client_id: config.clientId,
        client_secret: Secret.value(config.clientSecret),
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
