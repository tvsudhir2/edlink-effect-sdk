import { Redacted } from "effect";
import type { HttpClient } from "effect/unstable/http";

import type { RequestContext } from "@/api/v2/request.js";
import type { EdlinkConfigData } from "@/config.js";

// ---------------------------------------------------------------------------
// Shared test configuration — reused across all domain test files
// ---------------------------------------------------------------------------

export const testConfig: EdlinkConfigData = {
  clientSecret: Redacted.make("test-secret"),
  apiBaseUrl: "https://test.edlink.api",
  defaultMaxPages: 3,
};

/**
 * Build a `RequestContext` for tests — pairs `testConfig` with a mock HTTP client.
 */
export const makeCtx = (httpClient: HttpClient.HttpClient): RequestContext => ({
  config: testConfig,
  httpClient,
});
