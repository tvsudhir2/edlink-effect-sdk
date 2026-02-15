import { Effect, Stream } from "effect";
import { HttpClient } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Agent } from "../../schemas/agent.js";
import { Agent as AgentSchema } from "../../schemas/agent.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne } from "./request.js";

const BASE = "/v2/graph/agents";

export const listAgents = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<Agent, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, AgentSchema, pagination);

export const fetchAgent = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  agentId: string,
): Effect.Effect<Agent, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, `${BASE}/${agentId}`, AgentSchema);
