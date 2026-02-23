import { Effect, Redacted } from "effect";
import { describe, expect, it } from "vitest";
import { fetchMyProfile } from "../src/api/v2/profile.js";
import type { EdlinkUserConfigData } from "../src/config.js";
import { EdlinkApiError, EdlinkDecodeError } from "../src/errors.js";
import { userProfileFixture } from "./helpers/fixtures.js";
import { makeTestHttpClient } from "./helpers/mock-http-client.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const userConfig: EdlinkUserConfigData = {
  clientId: "test-client-id",
  clientSecret: Redacted.make("test-client-secret"),
  redirectUri: "https://app.example.com/callback",
  apiBaseUrl: "https://test.edlink.api",
};

const BASE_URL = userConfig.apiBaseUrl;
const ACCESS_TOKEN = "user-access-token-123";

const run = <A, E>(e: Effect.Effect<A, E>) => Effect.runPromise(e as Effect.Effect<A, never>);
const runFail = <A, E>(e: Effect.Effect<A, E>) => Effect.runPromise(Effect.flip(e));

const ok = (body: unknown) => ({ status: 200, body });
const fail = (status: number) => ({ status, body: { error: "err" } });

// ============================================================================
// fetchMyProfile
// ============================================================================

describe("fetchMyProfile", () => {
  it("GETs /v2/my/profile with bearer token and decodes UserProfile", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return ok({ $data: userProfileFixture });
    });
    const result = await run(fetchMyProfile(ACCESS_TOKEN, { config: userConfig, httpClient: client }));

    expect(req.method).toBe("GET");
    expect(req.url).toBe(`${BASE_URL}/v2/my/profile`);
    expect(req.headers.authorization).toBe(`Bearer ${ACCESS_TOKEN}`);
    expect(result.id).toBe("user-001");
    expect(result.first_name).toBe("Test");
    expect(result.last_name).toBe("User");
    expect(result.email).toBe("test@example.com");
  });

  it("returns EdlinkApiError on 401", async () => {
    const err = await runFail(
      fetchMyProfile(ACCESS_TOKEN, {
        config: userConfig,
        httpClient: makeTestHttpClient(() => fail(401)),
      }),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });

  it("returns EdlinkDecodeError on bad response shape", async () => {
    const err = await runFail(
      fetchMyProfile(ACCESS_TOKEN, {
        config: userConfig,
        httpClient: makeTestHttpClient(() => ok({ $data: { id: "x" } })),
      }),
    );
    expect(err).toBeInstanceOf(EdlinkDecodeError);
  });
});
