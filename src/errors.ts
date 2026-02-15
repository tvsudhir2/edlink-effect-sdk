import { Data } from "effect";

// ---------------------------------------------------------------------------
// Errors — each gets its own tag for Effect.catchTag discrimination
// ---------------------------------------------------------------------------

/** Network / HTTP-level failure when calling the Edlink API */
export class EdlinkApiError extends Data.TaggedError("EdlinkApiError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/** Schema decode failure — API returned data that doesn't match our schema */
export class EdlinkDecodeError extends Data.TaggedError("EdlinkDecodeError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
