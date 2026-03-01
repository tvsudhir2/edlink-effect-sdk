import type { Effect, Stream } from "effect";

import { fetchOne, type RequestContext } from "@/api/v2/request.js";
import { createPaginatedStream } from "@/api/v2/stream.js";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import { EdlinkEvent } from "@/schemas/event.js";

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const EVENTS_PATH = "/v2/graph/events" as const;
const eventPath = (eventId: string) => `/v2/graph/events/${eventId}`;

// ---------------------------------------------------------------------------
// Options types
// ---------------------------------------------------------------------------

export interface ListEventsOptions {
  readonly pagination: PaginationConfig;
}

export interface FetchEventOptions {
  readonly eventId: string;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export const listEvents = (
  options: ListEventsOptions,
  ctx: RequestContext,
): Stream.Stream<EdlinkEvent, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: EVENTS_PATH, schema: EdlinkEvent }, options.pagination, ctx);

export const fetchEvent = (
  options: FetchEventOptions,
  ctx: RequestContext,
): Effect.Effect<EdlinkEvent, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: eventPath(options.eventId), schema: EdlinkEvent }, ctx);
