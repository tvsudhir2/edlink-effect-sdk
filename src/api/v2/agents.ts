import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Agent } from "../../schemas/agent.js";
import { Agent as AgentSchema } from "../../schemas/agent.js";
import { fetchOne, type RequestContext } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const BASE = "/v2/graph/agents";

export const listAgents = (
  pagination: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<Agent, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: BASE, schema: AgentSchema }, pagination, ctx);

export const fetchAgent = (
  agentId: string,
  ctx: RequestContext,
): Effect.Effect<Agent, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: `${BASE}/${agentId}`, schema: AgentSchema }, ctx);
