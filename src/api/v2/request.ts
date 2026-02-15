import { Effect, Secret, Schema } from "effect";
import { HttpClient, HttpClientRequest, HttpBody } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";

// ---------------------------------------------------------------------------
// Single-entity response schema
// ---------------------------------------------------------------------------

const SingleResponseSchema = <A, I>(itemSchema: Schema.Schema<A, I>) =>
  Schema.Struct({
    $data: itemSchema,
  });

// ---------------------------------------------------------------------------
// fetchOne — GET a single entity by ID
// ---------------------------------------------------------------------------

export const fetchOne = <A, I>(
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  path: string,
  itemSchema: Schema.Schema<A, I>,
): Effect.Effect<A, EdlinkApiError | EdlinkDecodeError> => {
  const client = httpClient.pipe(HttpClient.filterStatusOk);
  const responseSchema = SingleResponseSchema(itemSchema);
  const decode = Schema.decodeUnknown(responseSchema);

  return Effect.gen(function* () {
    const url = `${config.apiBaseUrl}${path}`;

    const request = HttpClientRequest.get(url).pipe(
      HttpClientRequest.bearerToken(Secret.value(config.clientSecret)),
    );

    const response = yield* client.execute(request).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `HTTP request failed: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const raw = yield* response.json.pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `Failed to parse JSON response: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const result = yield* decode(raw).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkDecodeError({
            message: `Response schema mismatch: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    return result.$data;
  });
};

// ---------------------------------------------------------------------------
// createOne — POST a new entity
// ---------------------------------------------------------------------------

export const createOne = <A, I>(
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  path: string,
  itemSchema: Schema.Schema<A, I>,
  body: Record<string, unknown>,
): Effect.Effect<A, EdlinkApiError | EdlinkDecodeError> => {
  const client = httpClient.pipe(HttpClient.filterStatusOk);
  const responseSchema = SingleResponseSchema(itemSchema);
  const decode = Schema.decodeUnknown(responseSchema);

  return Effect.gen(function* () {
    const url = `${config.apiBaseUrl}${path}`;

    const request = HttpClientRequest.post(url).pipe(
      HttpClientRequest.bearerToken(Secret.value(config.clientSecret)),
      HttpClientRequest.bodyJson(body),
    );

    // bodyJson returns an Effect, so we need to unwrap
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
            message: `HTTP request failed: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const raw = yield* response.json.pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `Failed to parse JSON response: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const result = yield* decode(raw).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkDecodeError({
            message: `Response schema mismatch: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    return result.$data;
  });
};

// ---------------------------------------------------------------------------
// updateOne — PATCH an existing entity
// ---------------------------------------------------------------------------

export const updateOne = <A, I>(
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  path: string,
  itemSchema: Schema.Schema<A, I>,
  body: Record<string, unknown>,
): Effect.Effect<A, EdlinkApiError | EdlinkDecodeError> => {
  const client = httpClient.pipe(HttpClient.filterStatusOk);
  const responseSchema = SingleResponseSchema(itemSchema);
  const decode = Schema.decodeUnknown(responseSchema);

  return Effect.gen(function* () {
    const url = `${config.apiBaseUrl}${path}`;

    const request = HttpClientRequest.patch(url).pipe(
      HttpClientRequest.bearerToken(Secret.value(config.clientSecret)),
      HttpClientRequest.bodyJson(body),
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
            message: `HTTP request failed: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const raw = yield* response.json.pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `Failed to parse JSON response: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    const result = yield* decode(raw).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkDecodeError({
            message: `Response schema mismatch: ${String(err)}`,
            cause: err,
          }),
      ),
    );

    return result.$data;
  });
};

// ---------------------------------------------------------------------------
// deleteOne — DELETE an entity
// ---------------------------------------------------------------------------

export const deleteOne = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  path: string,
): Effect.Effect<void, EdlinkApiError> => {
  const client = httpClient.pipe(HttpClient.filterStatusOk);

  return Effect.gen(function* () {
    const url = `${config.apiBaseUrl}${path}`;

    const request = HttpClientRequest.del(url).pipe(
      HttpClientRequest.bearerToken(Secret.value(config.clientSecret)),
    );

    yield* client.execute(request).pipe(
      Effect.mapError(
        (err) =>
          new EdlinkApiError({
            message: `HTTP request failed: ${String(err)}`,
            cause: err,
          }),
      ),
    );
  });
};
