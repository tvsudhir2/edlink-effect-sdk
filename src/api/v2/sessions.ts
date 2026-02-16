import type { HttpClient } from "@effect/platform";
import type { Effect, Stream } from "effect";
import type { EdlinkConfigData } from "../../config.js";
import type { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Session } from "../../schemas/session.js";
import { Session as SessionSchema } from "../../schemas/session.js";
import { fetchOne } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const BASE = "/v2/graph/sessions";

export const listSessions = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<Session, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, SessionSchema, pagination);

export const fetchSession = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  sessionId: string,
): Effect.Effect<Session, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, `${BASE}/${sessionId}`, SessionSchema);
