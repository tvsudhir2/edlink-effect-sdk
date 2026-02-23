import { type HttpBody, HttpClient, HttpClientRequest } from "effect/unstable/http";
import { Effect, Redacted, Schema } from "effect";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";

// ---------------------------------------------------------------------------
// Shared option types
// ---------------------------------------------------------------------------

/** Bundles the two runtime dependencies that every API call needs. */
export interface RequestContext {
  readonly config: EdlinkConfigData;
  readonly httpClient: HttpClient.HttpClient;
}

/** Identifies an API endpoint and how to decode its response. */
export interface EndpointOptions<A> {
  readonly path: string;
  readonly schema: Schema.Decoder<A>;
}

// ---------------------------------------------------------------------------
// Single-entity response schema
// ---------------------------------------------------------------------------

const SingleResponseSchema = <A>(itemSchema: Schema.Decoder<A>) =>
  Schema.Struct({
    $data: itemSchema,
  });

// ---------------------------------------------------------------------------
// fetchOne — GET a single entity by ID
// ---------------------------------------------------------------------------

export const fetchOne = <A>(
  endpoint: EndpointOptions<A>,
  ctx: RequestContext,
): Effect.Effect<A, EdlinkApiError | EdlinkDecodeError> => {
  const client = ctx.httpClient.pipe(HttpClient.filterStatusOk);
  const responseSchema = SingleResponseSchema(endpoint.schema);
  const decode = Schema.decodeUnknownEffect(responseSchema);

  return Effect.gen(function* () {
    const url = `${ctx.config.apiBaseUrl}${endpoint.path}`;

    const request = HttpClientRequest.get(url).pipe(
      HttpClientRequest.bearerToken(Redacted.value(ctx.config.clientSecret)),
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

export const createOne = <A>(
  endpoint: EndpointOptions<A>,
  body: Record<string, unknown>,
  ctx: RequestContext,
): Effect.Effect<A, EdlinkApiError | EdlinkDecodeError> => {
  const client = ctx.httpClient.pipe(HttpClient.filterStatusOk);
  const responseSchema = SingleResponseSchema(endpoint.schema);
  const decode = Schema.decodeUnknownEffect(responseSchema);

  return Effect.gen(function* () {
    const url = `${ctx.config.apiBaseUrl}${endpoint.path}`;

    const request = HttpClientRequest.post(url).pipe(
      HttpClientRequest.bearerToken(Redacted.value(ctx.config.clientSecret)),
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

export const updateOne = <A>(
  endpoint: EndpointOptions<A>,
  body: Record<string, unknown>,
  ctx: RequestContext,
): Effect.Effect<A, EdlinkApiError | EdlinkDecodeError> => {
  const client = ctx.httpClient.pipe(HttpClient.filterStatusOk);
  const responseSchema = SingleResponseSchema(endpoint.schema);
  const decode = Schema.decodeUnknownEffect(responseSchema);

  return Effect.gen(function* () {
    const url = `${ctx.config.apiBaseUrl}${endpoint.path}`;

    const request = HttpClientRequest.patch(url).pipe(
      HttpClientRequest.bearerToken(Redacted.value(ctx.config.clientSecret)),
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

export const deleteOne = (path: string, ctx: RequestContext): Effect.Effect<void, EdlinkApiError> => {
  const client = ctx.httpClient.pipe(HttpClient.filterStatusOk);

  return Effect.gen(function* () {
    const url = `${ctx.config.apiBaseUrl}${path}`;

    const request = HttpClientRequest.delete(url).pipe(
      HttpClientRequest.bearerToken(Redacted.value(ctx.config.clientSecret)),
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
