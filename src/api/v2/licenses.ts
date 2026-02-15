import { Stream } from "effect";
import { HttpClient } from "@effect/platform";
import type { EdlinkConfigData } from "../../config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { License } from "../../schemas/license.js";
import { License as LicenseSchema } from "../../schemas/license.js";
import { createPaginatedStream } from "./stream.js";

const BASE = "/v2/graph/licenses";

export const listLicenses = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  pagination: PaginationConfig,
): Stream.Stream<License, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, BASE, LicenseSchema, pagination);
