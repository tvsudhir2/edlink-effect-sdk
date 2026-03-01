import { Effect, Stream } from "effect";
import { testConfig } from "@tests/helpers/test-config.js";

// ---------------------------------------------------------------------------
// Effect / Stream runners
// ---------------------------------------------------------------------------

/** Run an Effect, casting away the error channel (use in tests that expect success). */
export const run = <A, E>(e: Effect.Effect<A, E>): Promise<A> =>
  Effect.runPromise(e as Effect.Effect<A, never>);

/** Run an Effect and return the error (use in tests that expect failure). */
export const runFail = <A, E>(e: Effect.Effect<A, E>): Promise<E> =>
  Effect.runPromise(Effect.flip(e));

/** Collect all items from a Stream into an array (expects success). */
export const collect = <A, E>(s: Stream.Stream<A, E>): Promise<readonly A[]> =>
  run(Stream.runCollect(s));

/** Collect the error from a Stream (expects failure). */
export const collectFail = <A, E>(s: Stream.Stream<A, E>): Promise<E> =>
  Effect.runPromise(Effect.flip(Stream.runCollect(s)));

// ---------------------------------------------------------------------------
// HTTP response builders
// ---------------------------------------------------------------------------

/** Build a 200 OK mock response with an arbitrary JSON body. */
export const ok = (body: unknown): { status: number; body: unknown } => ({ status: 200, body });

/** Build an error mock response with `{ error: "err" }` body. */
export const fail = (status: number): { status: number; body: unknown } => ({
  status,
  body: { error: "err" },
});

/** Build a single-item response envelope `{ $data: data }`. */
export const single = (data: unknown) => ok({ $data: data });

/** Build a paginated response envelope `{ $data: data, $next: next }`. */
export const page = (data: unknown[], next: string | null = null) =>
  ok({ $data: data, $next: next });

// ---------------------------------------------------------------------------
// Shared test base URL (keeps tests in sync with testConfig)
// ---------------------------------------------------------------------------

export const BASE = testConfig.apiBaseUrl;
