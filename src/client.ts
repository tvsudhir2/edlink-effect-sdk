import { Effect, Context, Layer, Stream } from "effect";
import { HttpClient } from "@effect/platform";
import { EdlinkConfig } from "./config.js";
import { EdlinkApiError, EdlinkDecodeError } from "./errors.js";
import type { PaginationConfig } from "./pagination.js";
import type { EdlinkEvent } from "./schemas/event.js";
import { createEventsStream } from "./api/v2/events.js";

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

/**
 * Edlink API Client — currently events-only.
 *
 * Adding new entity types (people, schools, …) follows the same pattern:
 *   1. Create a schema in `src/schemas/`
 *   2. Create a stream builder in `src/api/v2/`
 *   3. Add a method here
 *
 * Switching API versions: create `src/api/v3/events.ts` and update
 * the delegation below — no downstream consumer changes needed.
 */
export class EdlinkClient extends Context.Tag("EdlinkClient")<
  EdlinkClient,
  {
    /** Lazy, paginated stream of Edlink events */
    readonly getEventsStream: (
      config?: PaginationConfig,
    ) => Stream.Stream<EdlinkEvent, EdlinkApiError | EdlinkDecodeError>;
  }
>() {}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

const makeEdlinkClient = Effect.gen(function* () {
  const edlinkConfig = yield* EdlinkConfig;
  const httpClient = yield* HttpClient.HttpClient;

  const defaultPagination: PaginationConfig = {
    type: "pages",
    maxPages: edlinkConfig.defaultMaxPages,
  };

  return {
    getEventsStream: (pagination?: PaginationConfig) =>
      createEventsStream(
        edlinkConfig,
        httpClient,
        pagination ?? defaultPagination,
      ),
  };
});

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

/** Live layer — requires `EdlinkConfig` and `HttpClient` from context */
export const EdlinkClientLive: Layer.Layer<
  EdlinkClient,
  never,
  EdlinkConfig | HttpClient.HttpClient
> = Layer.effect(EdlinkClient, makeEdlinkClient);
