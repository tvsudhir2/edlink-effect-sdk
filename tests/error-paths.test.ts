/**
 * Error-path tests — exercise the `mapError` branches inside request.ts,
 * oauth.ts, and profile.ts that only fire on failures.
 *
 * Grouped by error scenario so each test covers all five code paths at once
 * (fetchOne, updateOne, exchangeCode, refreshToken, fetchMyProfile).
 */
import { HttpClient, HttpClientResponse } from "@effect/platform";
import { Effect, Secret } from "effect";
import { describe, expect, it } from "vitest";
import { fetchAgent } from "../src/api/v2/agents.js";
import { updateAssignment } from "../src/api/v2/assignments.js";
import { exchangeCode, refreshToken } from "../src/api/v2/oauth.js";
import { fetchMyProfile } from "../src/api/v2/profile.js";
import type { EdlinkUserConfigData } from "../src/config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { makeTestHttpClient } from "./helpers/mock-http-client.js";
import { testConfig } from "./helpers/test-config.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const userConfig: EdlinkUserConfigData = {
  clientId: "test-client-id",
  clientSecret: Secret.fromString("test-client-secret"),
  redirectUri: "http://localhost:3000/callback",
  apiBaseUrl: "https://test.edlink.api",
};

const BASE = userConfig.apiBaseUrl;

const make500Client = () => makeTestHttpClient(() => ({ status: 500, body: { error: "Server Error" } }));

const makeInvalidJsonClient = () =>
  HttpClient.make((req) => {
    const res = new Response("<<<not json>>>", { status: 200, headers: { "content-type": "text/plain" } });
    return Effect.succeed(HttpClientResponse.fromWeb(req, res));
  });

const makeBadSchemaClient = () => makeTestHttpClient(() => ({ status: 200, body: { totally: "wrong" } }));

/** Flip all five functions against the given client and return their errors */
const collectErrors = (client: HttpClient.HttpClient) =>
  Effect.all([
    fetchAgent(testConfig, client, "a1").pipe(Effect.flip),
    updateAssignment(testConfig, client, "c1", "a1", { title: "x" }).pipe(Effect.flip),
    exchangeCode(userConfig, client, "code").pipe(Effect.flip),
    refreshToken(userConfig, client, "tok").pipe(Effect.flip),
    fetchMyProfile(BASE, client, "tok").pipe(Effect.flip),
  ]);

// ---------------------------------------------------------------------------
// Tests — one per error scenario, each covering all code paths
// ---------------------------------------------------------------------------

describe("error paths", () => {
  it("wraps HTTP failures as EdlinkApiError", async () => {
    const errors = await Effect.runPromise(collectErrors(make500Client()));
    for (const err of errors) {
      expect(err).toBeInstanceOf(EdlinkApiError);
      expect(err.message).toMatch(/failed/i);
    }
  });

  it("wraps unparseable JSON as EdlinkApiError", async () => {
    const errors = await Effect.runPromise(collectErrors(makeInvalidJsonClient()));
    for (const err of errors) {
      expect(err).toBeInstanceOf(EdlinkApiError);
      expect(err.message).toMatch(/parse/i);
    }
  });

  it("wraps schema mismatches as EdlinkDecodeError", async () => {
    const errors = await Effect.runPromise(collectErrors(makeBadSchemaClient()));
    for (const err of errors) {
      expect(err).toBeInstanceOf(EdlinkDecodeError);
    }
  });
});
