import { Effect, Layer, Option, Redacted } from "effect";
import { HttpClient } from "effect/unstable/http";
import { describe, expect, it } from "vitest";
import type { EdlinkUserConfigData } from "../src/config.js";
import { EdlinkUserConfig } from "../src/config.js";
import { EdlinkApiError } from "../src/errors.js";
import { TokenData } from "../src/schemas/token.js";
import { InMemoryTokenStoreLive } from "../src/token-store.js";
import { EdlinkUserClient, EdlinkUserClientLive } from "../src/user-client.js";
import { tokenResponseFixture, userProfileFixture } from "./helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "./helpers/mock-http-client.js";

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

const userConfig: EdlinkUserConfigData = {
  clientId: "test-client-id",
  clientSecret: Redacted.make("test-client-secret"),
  redirectUri: "https://app.example.com/callback",
  apiBaseUrl: "https://test.edlink.api",
};

const _BASE = userConfig.apiBaseUrl;

/** Build a full Layer stack for EdlinkUserClient with a custom HttpClient */
const buildLayer = (handler: MockHandler) => {
  const configLayer = Layer.succeed(EdlinkUserConfig, userConfig);
  const httpLayer = Layer.succeed(HttpClient.HttpClient, makeTestHttpClient(handler));

  return EdlinkUserClientLive.pipe(
    Layer.provide(configLayer),
    Layer.provide(httpLayer),
    Layer.provide(InMemoryTokenStoreLive),
  );
};

const runWith = <A, E>(handler: MockHandler, effect: (client: EdlinkUserClient["Type"]) => Effect.Effect<A, E>) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const client = yield* EdlinkUserClient;
      return yield* effect(client);
    }).pipe(Effect.provide(buildLayer(handler))) as Effect.Effect<A, never>,
  );

const runFailWith = <A, E>(handler: MockHandler, effect: (client: EdlinkUserClient["Type"]) => Effect.Effect<A, E>) =>
  Effect.runPromise(
    Effect.flip(
      Effect.gen(function* () {
        const client = yield* EdlinkUserClient;
        return yield* effect(client);
      }).pipe(Effect.provide(buildLayer(handler))),
    ),
  );

// Response helpers
const ok = (body: unknown) => ({ status: 200, body });
const fail = (status: number) => ({ status, body: { error: "err" } });

// ============================================================================
// authorize
// ============================================================================

describe("authorize", () => {
  it("builds authorization URL with config defaults", async () => {
    const url = await runWith(
      () => ok({}),
      (client) => Effect.succeed(client.authorize()),
    );
    const parsed = new URL(url);
    expect(parsed.searchParams.get("client_id")).toBe("test-client-id");
    expect(parsed.searchParams.get("redirect_uri")).toBe("https://app.example.com/callback");
    expect(parsed.searchParams.get("response_type")).toBe("code");
  });

  it("includes scopes and state when provided", async () => {
    const url = await runWith(
      () => ok({}),
      (client) => Effect.succeed(client.authorize(["openid"], "state-abc")),
    );
    const parsed = new URL(url);
    expect(parsed.searchParams.get("scope")).toBe("openid");
    expect(parsed.searchParams.get("state")).toBe("state-abc");
  });
});

// ============================================================================
// handleCallback
// ============================================================================

describe("handleCallback", () => {
  it("exchanges code, fetches profile, stores tokens, returns TokenResponse", async () => {
    let callCount = 0;
    const handler: MockHandler = (r) => {
      callCount++;
      if (r.url.includes("/authentication/token")) {
        return ok({ $data: tokenResponseFixture });
      }
      if (r.url.includes("/my/profile")) {
        return ok({ $data: userProfileFixture });
      }
      return fail(404);
    };

    const result = await runWith(handler, (client) => client.handleCallback("auth-code"));
    expect(result.access_token).toBe("access-abc-123");
    expect(result.refresh_token).toBe("refresh-xyz-789");
    expect(callCount).toBe(2); // token exchange + profile fetch
  });

  it("returns EdlinkApiError when code exchange fails", async () => {
    const err = await runFailWith(
      () => fail(400),
      (client) => client.handleCallback("bad-code"),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });
});

// ============================================================================
// getAccessToken
// ============================================================================

describe("getAccessToken", () => {
  it("returns None when no tokens are stored", async () => {
    const result = await runWith(
      () => ok({}),
      (client) => client.getAccessToken("unknown-user"),
    );
    expect(Option.isNone(result)).toBe(true);
  });

  it("returns Some(accessToken) after handleCallback stores tokens", async () => {
    const handler: MockHandler = (r) => {
      if (r.url.includes("/authentication/token")) {
        return ok({
          $data: { ...tokenResponseFixture, expires_in: 7200 }, // 2 hours — well within buffer
        });
      }
      if (r.url.includes("/my/profile")) {
        return ok({ $data: userProfileFixture });
      }
      return fail(404);
    };

    const result = await runWith(handler, (client) =>
      Effect.gen(function* () {
        yield* client.handleCallback("code");
        // The userId is derived from the profile (user-001)
        return yield* client.getAccessToken("user-001");
      }),
    );
    expect(Option.isSome(result)).toBe(true);
    if (Option.isSome(result)) {
      expect(result.value).toBe("access-abc-123");
    }
  });

  it("refreshes token when expired and returns new access token", async () => {
    let tokenCallCount = 0;
    const handler: MockHandler = (r) => {
      if (r.url.includes("/authentication/token")) {
        tokenCallCount++;
        if (tokenCallCount === 1) {
          // Initial exchange — return token that expires immediately
          return ok({ $data: { ...tokenResponseFixture, expires_in: 0 } });
        }
        // Refresh — return new token
        return ok({
          $data: { ...tokenResponseFixture, access_token: "refreshed-token", expires_in: 7200 },
        });
      }
      if (r.url.includes("/my/profile")) {
        return ok({ $data: userProfileFixture });
      }
      return fail(404);
    };

    const result = await runWith(handler, (client) =>
      Effect.gen(function* () {
        yield* client.handleCallback("code");
        return yield* client.getAccessToken("user-001");
      }),
    );
    expect(Option.isSome(result)).toBe(true);
    if (Option.isSome(result)) {
      expect(result.value).toBe("refreshed-token");
    }
    expect(tokenCallCount).toBe(2); // initial + refresh
  });
});

// ============================================================================
// getProfile
// ============================================================================

describe("getProfile", () => {
  it("returns EdlinkApiError when no tokens are stored", async () => {
    const err = await runFailWith(
      () => ok({}),
      (client) => client.getProfile("unknown-user"),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });

  it("fetches profile with valid token", async () => {
    const handler: MockHandler = (r) => {
      if (r.url.includes("/authentication/token")) {
        return ok({ $data: { ...tokenResponseFixture, expires_in: 7200 } });
      }
      if (r.url.includes("/my/profile")) {
        return ok({ $data: userProfileFixture });
      }
      return fail(404);
    };

    const profile = await runWith(handler, (client) =>
      Effect.gen(function* () {
        yield* client.handleCallback("code");
        return yield* client.getProfile("user-001");
      }),
    );
    expect(profile.id).toBe("user-001");
    expect(profile.first_name).toBe("Test");
  });
});

// ============================================================================
// storeTokens / removeTokens
// ============================================================================

describe("storeTokens / removeTokens", () => {
  it("stores tokens and retrieves access token; removes and returns None", async () => {
    const handler: MockHandler = (r) => {
      // Only needed if getAccessToken triggers a refresh
      if (r.url.includes("/authentication/token")) {
        return ok({ $data: tokenResponseFixture });
      }
      return fail(404);
    };

    const result = await runWith(handler, (client) =>
      Effect.gen(function* () {
        const tokenData = new TokenData({
          accessToken: "stored-access",
          refreshToken: "stored-refresh",
          expiresAt: Date.now() + 7200_000,
        });

        yield* client.storeTokens("manual-user", tokenData);
        const accessOpt = yield* client.getAccessToken("manual-user");

        yield* client.removeTokens("manual-user");
        const removedOpt = yield* client.getAccessToken("manual-user");

        return { accessOpt, removedOpt };
      }),
    );

    expect(Option.isSome(result.accessOpt)).toBe(true);
    if (Option.isSome(result.accessOpt)) {
      expect(result.accessOpt.value).toBe("stored-access");
    }
    expect(Option.isNone(result.removedOpt)).toBe(true);
  });
});
