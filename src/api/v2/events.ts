import type { HttpClient } from "@effect/platform";
import type { Stream } from "effect";
import type { EdlinkConfigData } from "../../config.js";
import type { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import { EdlinkEvent } from "../../schemas/event.js";
import { createPaginatedStream } from "./stream.js";

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
 * Delegates to the generic `createPaginatedStream` with the events schema.
 */
export const createEventsStream = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  paginationConfig: PaginationConfig,
): Stream.Stream<EdlinkEvent, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, EVENTS_PATH, EdlinkEvent, paginationConfig);
