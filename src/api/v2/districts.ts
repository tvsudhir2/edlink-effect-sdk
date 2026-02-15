import { Effect, Stream } from "effect";
import { HttpClient } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { District } from "../../schemas/district.js";
import type { Person } from "../../schemas/person.js";
import { PaginatedDistrictsSchema, PaginatedPeopleSchema } from "../../schemas/paginated.js";
import { District as DistrictSchema } from "../../schemas/district.js";
import { createPaginatedStream } from "./stream.js";
import { fetchOne } from "./request.js";

const BASE = "/v2/graph/districts";

export const listDistricts = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<District, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, PaginatedDistrictsSchema, pagination);

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
  createPaginatedStream(config, httpClient, `${BASE}/${districtId}/administrators`, PaginatedPeopleSchema, pagination);
