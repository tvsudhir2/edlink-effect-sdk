import { Redacted } from "effect";
import { describe, expect, it } from "vitest";

import { tokenResponseFixture } from "@tests/helpers/fixtures.js";
import { makeTestHttpClient } from "@tests/helpers/mock-http-client.js";
import { fail, ok, run, runFail } from "@tests/helpers/test-utils.js";
import { buildAuthorizationUrl, exchangeCode, refreshToken } from "@/api/v2/oauth.js";
import type { EdlinkUserConfigData } from "@/config.js";
import { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";

// ---------------------------------------------------------------------------
// Test config for User/OAuth API
// ---------------------------------------------------------------------------

const userConfig: EdlinkUserConfigData = {
  clientId: "test-client-id",
  clientSecret: Redacted.make("test-client-secret"),
  redirectUri: "https://app.example.com/callback",
  apiBaseUrl: "https://test.edlink.api",
};

const BASE = userConfig.apiBaseUrl;

// ============================================================================
// buildAuthorizationUrl (pure function)
// ============================================================================

describe("buildAuthorizationUrl", () => {
  it("builds a URL with client_id, redirect_uri, and response_type", () => {
    const url = buildAuthorizationUrl({}, userConfig);
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe(`${BASE}/authentication/authorize`);
    expect(parsed.searchParams.get("client_id")).toBe("test-client-id");
    expect(parsed.searchParams.get("redirect_uri")).toBe("https://app.example.com/callback");
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.has("scope")).toBe(false);
    expect(parsed.searchParams.has("state")).toBe(false);
  });

  it("includes scope when scopes are provided", () => {
    const url = buildAuthorizationUrl({ scopes: ["openid", "profile"] }, userConfig);
    const parsed = new URL(url);
    expect(parsed.searchParams.get("scope")).toBe("openid profile");
  });

  it("includes state when state is provided", () => {
    const url = buildAuthorizationUrl({ state: "csrf-token-123" }, userConfig);
    const parsed = new URL(url);
    expect(parsed.searchParams.get("state")).toBe("csrf-token-123");
  });

  it("includes both scope and state", () => {
    const url = buildAuthorizationUrl({ scopes: ["openid"], state: "my-state" }, userConfig);
    const parsed = new URL(url);
    expect(parsed.searchParams.get("scope")).toBe("openid");
    expect(parsed.searchParams.get("state")).toBe("my-state");
  });
});

// ============================================================================
// exchangeCode
// ============================================================================

describe("exchangeCode", () => {
  it("POSTs to the token endpoint and returns decoded TokenResponse", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return ok({ $data: tokenResponseFixture });
    });
    const result = await run(exchangeCode("auth-code-xyz", { config: userConfig, httpClient: client }));

    expect(req.method).toBe("POST");
    expect(req.url).toBe(`${BASE}/v2/authentication/token`);
    expect(result.access_token).toBe("access-abc-123");
    expect(result.refresh_token).toBe("refresh-xyz-789");
    expect(result.expires_in).toBe(3600);
  });

  it("returns EdlinkApiError on 400", async () => {
    const err = await runFail(
      exchangeCode("bad-code", {
        config: userConfig,
        httpClient: makeTestHttpClient(() => fail(400)),
      }),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });

  it("returns EdlinkDecodeError on bad response shape", async () => {
    const err = await runFail(
      exchangeCode("code", {
        config: userConfig,
        httpClient: makeTestHttpClient(() => ok({ $data: { bad: true } })),
      }),
    );
    expect(err).toBeInstanceOf(EdlinkDecodeError);
  });
});

// ============================================================================
// refreshToken
// ============================================================================

describe("refreshToken", () => {
  it("POSTs to the token endpoint with refresh_token grant and returns decoded TokenResponse", async () => {
    let req: any;
    const client = makeTestHttpClient((r) => {
      req = r;
      return ok({ $data: tokenResponseFixture });
    });
    const result = await run(refreshToken("refresh-xyz-789", { config: userConfig, httpClient: client }));

    expect(req.method).toBe("POST");
    expect(req.url).toBe(`${BASE}/v2/authentication/token`);
    expect(result.access_token).toBe("access-abc-123");
    expect(result.refresh_token).toBe("refresh-xyz-789");
  });

  it("returns EdlinkApiError on 401", async () => {
    const err = await runFail(
      refreshToken("bad-token", {
        config: userConfig,
        httpClient: makeTestHttpClient(() => fail(401)),
      }),
    );
    expect(err).toBeInstanceOf(EdlinkApiError);
  });

  it("returns EdlinkDecodeError on bad response shape", async () => {
    const err = await runFail(
      refreshToken("tok", {
        config: userConfig,
        httpClient: makeTestHttpClient(() => ok({ $data: {} })),
      }),
    );
    expect(err).toBeInstanceOf(EdlinkDecodeError);
  });
});
