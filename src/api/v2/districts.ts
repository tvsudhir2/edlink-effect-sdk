import type { HttpClient } from "@effect/platform";
import type { Effect, Stream } from "effect";
import type { EdlinkConfigData } from "../../config.js";
import type { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { District } from "../../schemas/district.js";
import { District as DistrictSchema } from "../../schemas/district.js";
import type { Person } from "../../schemas/person.js";
import { Person as PersonSchema } from "../../schemas/person.js";
import { fetchOne } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const BASE = "/v2/graph/districts";

export const listDistricts = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<District, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, DistrictSchema, pagination);

export const fetchDistrict = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  districtId: string,
): Effect.Effect<District, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, `${BASE}/${districtId}`, DistrictSchema);

export const listDistrictAdministrators = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  districtId: string,
  pagination: PaginationConfig,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, `${BASE}/${districtId}/administrators`, PersonSchema, pagination);
