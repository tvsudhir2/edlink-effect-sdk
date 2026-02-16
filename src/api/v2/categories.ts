import type { HttpClient } from "@effect/platform";
import type { Effect, Stream } from "effect";
import type { EdlinkConfigData } from "../../config.js";
import type { EdlinkApiError, EdlinkDecodeError } from "../../errors.js";
import type { PaginationConfig } from "../../pagination.js";
import type { Category } from "../../schemas/category.js";
import { Category as CategorySchema } from "../../schemas/category.js";
import { createOne, deleteOne, fetchOne, updateOne } from "./request.js";
import { createPaginatedStream } from "./stream.js";

const classCategoriesPath = (classId: string) => `/v2/graph/classes/${classId}/categories`;

const classCategoryPath = (classId: string, categoryId: string) =>
  `/v2/graph/classes/${classId}/categories/${categoryId}`;

export const listCategories = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  pagination: PaginationConfig,
): Stream.Stream<Category, EdlinkApiError | EdlinkDecodeError> =>
  createPaginatedStream(config, httpClient, classCategoriesPath(classId), CategorySchema, pagination);

export const fetchCategory = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  categoryId: string,
): Effect.Effect<Category, EdlinkApiError | EdlinkDecodeError> =>
  fetchOne(config, httpClient, classCategoryPath(classId, categoryId), CategorySchema);

export const createCategory = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  body: Record<string, unknown>,
): Effect.Effect<Category, EdlinkApiError | EdlinkDecodeError> =>
  createOne(config, httpClient, classCategoriesPath(classId), CategorySchema, body);

export const updateCategory = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  categoryId: string,
  body: Record<string, unknown>,
): Effect.Effect<Category, EdlinkApiError | EdlinkDecodeError> =>
  updateOne(config, httpClient, classCategoryPath(classId, categoryId), CategorySchema, body);

export const deleteCategory = (
  config: EdlinkConfigData,
  httpClient: HttpClient.HttpClient,
  classId: string,
  categoryId: string,
): Effect.Effect<void, EdlinkApiError> => deleteOne(config, httpClient, classCategoryPath(classId, categoryId));
