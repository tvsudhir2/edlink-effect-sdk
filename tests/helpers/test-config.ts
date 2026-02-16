import { Secret } from "effect";
import type { EdlinkConfigData } from "../src/config.js";

// ---------------------------------------------------------------------------
// Shared test configuration — reused across all domain test files
// ---------------------------------------------------------------------------

export const testConfig: EdlinkConfigData = {
  clientSecret: Secret.fromString("test-secret"),
  apiBaseUrl: "https://test.edlink.api",
  defaultMaxPages: 3,
};
