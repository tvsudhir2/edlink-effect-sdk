import { HttpClient, HttpClientRequest } from "effect/unstable/http";
import { Effect, Option, Redacted, Schema, Stream } from "effect";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import {
  deriveNextUrl,
  type PaginationConfig,
  type PaginationState,
  shouldContinue,
  trimItems,
} from "../../pagination.js";
import { PaginatedResponseSchema } from "../../schemas/paginated.js";
import type { EndpointOptions, RequestContext } from "./request.js";

// ---------------------------------------------------------------------------
// Generic paginated stream builder
// ---------------------------------------------------------------------------

/**
 * Build a lazy, paginated `Stream` of items from any Edlink v2 endpoint.
 *
 * Pages are fetched on-demand via `Stream.unfoldEffect` — downstream
 * back-pressure controls when the next HTTP call is made.
 *
 * Responses are decoded through the provided item schema at the boundary
 * so malformed data fails fast with `EdlinkDecodeError`.
 *
 * Accepts an **item-level** schema (e.g. `Assignment`) instead of a
 * pre-built paginated schema — this ensures TypeScript displays the clean
 * class name on hover rather than expanding the full structural type.
 */
export const createPaginatedStream = <A>(
  endpoint: EndpointOptions<A>,
  paginationConfig: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<A, EdlinkApiError | EdlinkDecodeError> => {
  const client = ctx.httpClient.pipe(HttpClient.filterStatusOk);
  const paginatedSchema = PaginatedResponseSchema(endpoint.schema);
  const decode = Schema.decodeUnknownEffect(paginatedSchema);

  const initialState: PaginationState = {
    nextUrl: `${ctx.config.apiBaseUrl}${endpoint.path}`,
    pageCount: 0,
    recordCount: 0,
  };

  return Stream.paginate(initialState, (state) =>
    Effect.gen(function* () {
      if (!state.nextUrl || !shouldContinue(state, paginationConfig)) {
        return [[] as readonly A[], Option.none<PaginationState>()] as const;
      }

      const request = HttpClientRequest.get(state.nextUrl).pipe(
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

      const page = yield* decode(raw).pipe(
        Effect.mapError(
          (err) =>
            new EdlinkDecodeError({
              message: `Response schema mismatch: ${String(err)}`,
              cause: err,
            }),
        ),
      );

      const items = page.$data;
      if (items.length === 0) {
        return [[] as readonly A[], Option.none<PaginationState>()] as const;
      }

      const emitted = trimItems(state, paginationConfig, items);
      const newRecordCount = state.recordCount + emitted.length;

      const next: PaginationState = {
        nextUrl: deriveNextUrl({ cursor: page.$next ?? null, newRecordCount }, paginationConfig),
        pageCount: state.pageCount + 1,
        recordCount: newRecordCount,
      };

      return [emitted, Option.some(next)] as const;
    }),
  );
};
