import { HttpClient, type HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { Effect } from "effect";

// ---------------------------------------------------------------------------
// Mock HTTP client — the ONLY mock in the test suite
// ---------------------------------------------------------------------------

/**
 * Handler signature: receives the request, returns a status + JSON body.
 *
 * The handler also receives the raw `Request` URL string so paginated-stream
 * tests can dispatch different responses based on the cursor URL.
 */
export interface MockResponse {
  readonly status: number;
  readonly body?: unknown;
}

export type MockHandler = (request: HttpClientRequest.HttpClientRequest) => MockResponse;

/**
 * Build a real `HttpClient.HttpClient` whose network call is replaced by
 * `handler`.  Everything else — `filterStatusOk`, bearer-token injection,
 * JSON parsing, schema decoding — runs through the real production code.
 */
export const makeTestHttpClient = (handler: MockHandler): HttpClient.HttpClient =>
  HttpClient.make((request) => {
    const { status, body } = handler(request);

    const webResponse = new Response(body !== undefined ? JSON.stringify(body) : null, {
      status,
      headers: { "content-type": "application/json" },
    });

    return Effect.succeed(HttpClientResponse.fromWeb(request, webResponse));
  });
