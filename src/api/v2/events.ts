import { Effect, Stream, Option, Secret, Schema } from "effect";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import {
  type PaginationConfig,
  type PaginationState,
  shouldContinue,
  trimItems,
  deriveNextUrl,
} from "../../pagination.js";
import {
  type EdlinkEvent,
  PaginatedEventsSchema,
} from "../../schemas/event.js";

// ---------------------------------------------------------------------------
// V2-specific constants
// ---------------------------------------------------------------------------

/** Edlink Graph API v2 events path */
const EVENTS_PATH = "/v2/graph/events" as const;

// ---------------------------------------------------------------------------
// Stream builder
// ---------------------------------------------------------------------------

/**
 * Build a lazy, paginated `Stream` of events from the Edlink v2 Graph API.
 *
 * Pages are fetched on-demand via `Stream.unfoldEffect` — downstream back-pressure
 * controls when the next HTTP call is made.
 *
 * Responses are decoded through `PaginatedEventsSchema` at the boundary so
 * malformed data fails fast with `EdlinkDecodeError`.
 */
export const createEventsStream = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  paginationConfig: PaginationConfig,
): Stream.Stream<EdlinkEvent, EdlinkApiError | EdlinkDecodeError> => {
  const client = httpClient.pipe(HttpClient.filterStatusOk);
  const decode = Schema.decodeUnknown(PaginatedEventsSchema);

  const initialState: PaginationState = {
    nextUrl: `${config.apiBaseUrl}${EVENTS_PATH}`,
    pageCount: 0,
    recordCount: 0,
  };

  return Stream.unfoldEffect(initialState, (state) =>
    Effect.gen(function* () {
      if (!state.nextUrl || !shouldContinue(state, paginationConfig)) {
        return Option.none<readonly [readonly EdlinkEvent[], PaginationState]>();
      }

      // Build & execute request
      const request = HttpClientRequest.get(state.nextUrl).pipe(
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

      // Decode at the boundary
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
        return Option.none<readonly [readonly EdlinkEvent[], PaginationState]>();
      }

      const emitted = trimItems(items, state, paginationConfig);
      const newRecordCount = state.recordCount + emitted.length;

      const next: PaginationState = {
        nextUrl: deriveNextUrl(page.$next ?? null, newRecordCount, paginationConfig),
        pageCount: state.pageCount + 1,
        recordCount: newRecordCount,
      };

      return Option.some([emitted, next] as const);
    }),
  ).pipe(Stream.flatMap((items) => Stream.fromIterable(items)));
};
