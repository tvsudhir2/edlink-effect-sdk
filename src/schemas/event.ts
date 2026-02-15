import { Schema } from "effect";

// ---------------------------------------------------------------------------
// EdlinkEvent — runtime-validated schema for Edlink Graph API events
// ---------------------------------------------------------------------------

/** Schema for a single Edlink event. `id` and `type` are required at the boundary. */
export const EdlinkEventSchema = Schema.Struct({
  id: Schema.String,
  type: Schema.String,
  data: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  created_date: Schema.optional(Schema.String),
  updated_date: Schema.optional(Schema.String),
});

/** Inferred TypeScript type from the schema — replaces hand-written interface */
export type EdlinkEvent = typeof EdlinkEventSchema.Type;

// ---------------------------------------------------------------------------
// Paginated response — generic schema factory
// ---------------------------------------------------------------------------

/**
 * Build a paginated-response schema for any item type.
 * Edlink returns `{ $data: T[], $next: string | null }`.
 */
export const PaginatedResponseSchema = <A, I, R>(
  itemSchema: Schema.Schema<A, I, R>,
) =>
  Schema.Struct({
    $data: Schema.Array(itemSchema),
    $next: Schema.optional(Schema.NullOr(Schema.String)),
  });

/** Pre-built schema for paginated event responses */
export const PaginatedEventsSchema = PaginatedResponseSchema(EdlinkEventSchema);

/** Inferred type for a paginated events response */
export type PaginatedEventsResponse = typeof PaginatedEventsSchema.Type;
