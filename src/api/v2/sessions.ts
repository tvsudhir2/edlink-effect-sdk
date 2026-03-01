import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { Session } from "@/schemas/session.js";
import { Session as SessionSchema } from "@/schemas/session.js";
import { fetchOne, type RequestContext } from "@/api/v2/request.js";
import { createPaginatedStream } from "@/api/v2/stream.js";

const BASE = "/v2/graph/sessions";

export const listSessions = (
  pagination: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<Session, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: BASE, schema: SessionSchema }, pagination, ctx);

export const fetchSession = (
  sessionId: string,
  ctx: RequestContext,
): Effect.Effect<Session, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: `${BASE}/${sessionId}`, schema: SessionSchema }, ctx);
