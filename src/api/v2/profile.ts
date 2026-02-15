import { Effect, Schema } from "effect";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import { UserProfile } from "../../schemas/token.js";

// ---------------------------------------------------------------------------
// User profile response schema
// ---------------------------------------------------------------------------

const ProfileResponseSchema = Schema.Struct({
  $data: UserProfile,
});

// ---------------------------------------------------------------------------
// Fetch authenticated user's profile
// ---------------------------------------------------------------------------

/**
 * Fetch the authenticated user's profile.
 *
 * GET `/v2/my/profile` with the user's access token as bearer.
 */
export const fetchMyProfile = (
  apiBaseUrl: string,
  httpClient: HttpClient.HttpClient,
  accessToken: string,
): Effect.Effect<UserProfile, EdlinkApiError | EdlinkDecodeError> => {
  const client = httpClient.pipe(HttpClient.filterStatusOk);
  const decode = Schema.decodeUnknown(ProfileResponseSchema);

  return Effect.gen(function* () {
    const url = `${apiBaseUrl}/v2/my/profile`;

    const request = HttpClientRequest.get(url).pipe(
      HttpClientRequest.bearerToken(accessToken),
    );

    const response = yield* client.execute(request).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `Profile fetch failed: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const raw = yield* response.json.pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `Failed to parse profile response: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const result = yield* decode(raw).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkDecodeError({
            message: `Profile response schema mismatch: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    return result.$data;
  });
};
