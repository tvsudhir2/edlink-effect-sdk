import type { Effect, Stream } from "effect";
import type { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import type { PaginationConfig } from "@/pagination.js";
import type { Category } from "@/schemas/category.js";
import { Category as CategorySchema } from "@/schemas/category.js";
import { createOne, deleteOne, fetchOne, type RequestContext, updateOne } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const classCategoriesPath = (classId: string) => `/v2/graph/classes/${classId}/categories`;

const classCategoryPath = (classId: string, categoryId: string) =>
  `/v2/graph/classes/${classId}/categories/${categoryId}`;

// ---------------------------------------------------------------------------
// Options types
// ---------------------------------------------------------------------------

export interface ListCategoriesOptions {
  readonly classId: string;
  readonly pagination: PaginationConfig;
}

export interface FetchCategoryOptions {
  readonly classId: string;
  readonly categoryId: string;
}

export interface CreateCategoryOptions {
  readonly classId: string;
  readonly body: Record<string, unknown>;
}

export interface UpdateCategoryOptions {
  readonly classId: string;
  readonly categoryId: string;
  readonly body: Record<string, unknown>;
}

export interface DeleteCategoryOptions {
  readonly classId: string;
  readonly categoryId: string;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export const listCategories = (
  options: ListCategoriesOptions,
  ctx: RequestContext,
): Stream.Stream<Category, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(
    { path: classCategoriesPath(options.classId), schema: CategorySchema },
    options.pagination,
    ctx,
  );

export const fetchCategory = (
  options: FetchCategoryOptions,
  ctx: RequestContext,
): Effect.Effect<Category, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne({ path: classCategoryPath(options.classId, options.categoryId), schema: CategorySchema }, ctx);

export const createCategory = (
  options: CreateCategoryOptions,
  ctx: RequestContext,
): Effect.Effect<Category, EdlinkApiError | EdlinkDecodeError> =>
  createOne({ path: classCategoriesPath(options.classId), schema: CategorySchema }, options.body, ctx);

export const updateCategory = (
  options: UpdateCategoryOptions,
  ctx: RequestContext,
): Effect.Effect<Category, EdlinkApiError | EdlinkDecodeError> =>
  updateOne(
    { path: classCategoryPath(options.classId, options.categoryId), schema: CategorySchema },
    options.body,
    ctx,
  );

export const deleteCategory = (
  options: DeleteCategoryOptions,
  ctx: RequestContext,
): Effect.Effect<void, EdlinkApiError> => deleteOne(classCategoryPath(options.classId, options.categoryId), ctx);
