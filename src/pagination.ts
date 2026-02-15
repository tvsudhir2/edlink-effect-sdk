// ---------------------------------------------------------------------------
// Pagination config — discriminated union for exhaustive matching
// ---------------------------------------------------------------------------

/** Limit pagination to a specific number of pages */
export interface PaginateByPages {
  readonly type: "pages";
  readonly maxPages: number;
}

/** Limit pagination to a specific number of records (may stop mid-page) */
export interface PaginateByRecords {
  readonly type: "records";
  readonly maxRecords: number;
}

/** Fetch all available records with no limit */
export interface PaginateAll {
  readonly type: "all";
}

/**
 * Discriminated union — matches exhaustively in `switch` on `type`.
 *
 * @example
 * const cfg: PaginationConfig = { type: "pages", maxPages: 3 };
 * const cfg: PaginationConfig = { type: "records", maxRecords: 50 };
 * const cfg: PaginationConfig = { type: "all" };
 */
export type PaginationConfig = PaginateByPages | PaginateByRecords | PaginateAll;

// ---------------------------------------------------------------------------
// Pure helpers — stateless, side-effect-free, easily testable
// ---------------------------------------------------------------------------

export interface PaginationState {
  readonly nextUrl: string;
  readonly pageCount: number;
  readonly recordCount: number;
}

/** Should we fetch the next page given the current state and config? */
export const shouldContinue = (
  state: PaginationState,
  config: PaginationConfig,
): boolean => {
  switch (config.type) {
    case "all":
      return true;
    case "pages":
      return state.pageCount < config.maxPages;
    case "records":
      return state.recordCount < config.maxRecords;
  }
};

/** Trim items if emitting them would exceed the record cap; identity otherwise */
export const trimItems = <T>(
  items: readonly T[],
  state: PaginationState,
  config: PaginationConfig,
): readonly T[] => {
  if (config.type !== "records") return items;
  const remaining = config.maxRecords - state.recordCount;
  return items.length <= remaining ? items : items.slice(0, remaining);
};

/** Derive the next cursor URL — empty string signals "stop" */
export const deriveNextUrl = (
  cursor: string | null,
  newRecordCount: number,
  config: PaginationConfig,
): string => {
  if (!cursor) return "";
  if (config.type === "records" && newRecordCount >= config.maxRecords) return "";
  return cursor;
};
