import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { District } from "@/schemas/district.js";
import { District as DistrictSchema } from "@/schemas/district.js";
import type { Person } from "@/schemas/person.js";
import { Person as PersonSchema } from "@/schemas/person.js";
import { fetchOne, type RequestContext } from "@/api/v2/request.js";
import { createPaginatedStream } from "@/api/v2/stream.js";

const BASE = "/v2/graph/districts";

export interface ListDistrictSubResourceOptions {
  readonly districtId: string;
  readonly pagination: PaginationConfig;
}

export const listDistricts = (
  pagination: PaginationConfig,
  ctx: RequestContext,
): Stream.Stream<District, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream({ path: BASE, schema: DistrictSchema }, pagination, ctx);

export const fetchDistrict = (
  districtId: string,
  ctx: RequestContext,
): Effect.Effect<District, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: `${BASE}/${districtId}`, schema: DistrictSchema }, ctx);

export const listDistrictAdministrators = (
  options: ListDistrictSubResourceOptions,
  ctx: RequestContext,
): Stream.Stream<Person, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: `${BASE}/${options.districtId}/administrators`, schema: PersonSchema },
    options.pagination,
    ctx,
  );
