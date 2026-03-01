import type { Stream } from "effect";

import type { RequestContext } from "@/api/v2/request.js";
import { createPaginatedStream } from "@/api/v2/stream.js";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { License } from "@/schemas/license.js";
import { License as LicenseSchema } from "@/schemas/license.js";

const BASE = "/v2/graph/licenses";

export const listLicenses = (
  pagination: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<License, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: BASE, schema: LicenseSchema }, pagination, ctx);
