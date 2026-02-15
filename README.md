# Edlink Effect SDK

[![npm version](https://img.shields.io/npm/v/@tvsudhir2/edlink-effect-sdk)](https://www.npmjs.com/package/@tvsudhir2/edlink-effect-sdk)
[![license](https://img.shields.io/npm/l/@tvsudhir2/edlink-effect-sdk)](./LICENSE)
[![types](https://img.shields.io/npm/types/@tvsudhir2/edlink-effect-sdk)](https://www.npmjs.com/package/@tvsudhir2/edlink-effect-sdk)
[![node](https://img.shields.io/node/v/@tvsudhir2/edlink-effect-sdk)](https://nodejs.org)

Type-safe, functional SDK for the [Edlink](https://ed.link) v2 API — built on [Effect-TS](https://effect.website).

Every list endpoint returns a **lazy `Stream`** with cursor-based pagination. Every response is **schema-validated** at the boundary. Errors are **tagged** for precise `catchTag` recovery. Ships `.d.ts` types — no `@types/` package needed.

---

## Install

```bash
pnpm add @tvsudhir2/edlink-effect-sdk effect @effect/platform
```

> **Note:** `effect` and `@effect/platform` are peer-level requirements. Add a platform-specific runtime package for your environment (see [Runtime Compatibility](#runtime-compatibility)).

## Quick Start

```ts
import { Effect, Stream, Chunk } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { EdlinkClient, EdlinkLive } from "@tvsudhir2/edlink-effect-sdk";

const program = Effect.gen(function* () {
  const client = yield* EdlinkClient;

  // Fetch up to 3 pages of events (default)
  const events = yield* client
    .getEventsStream()
    .pipe(Stream.runCollect, Effect.map(Chunk.toArray));

  console.log(`Fetched ${events.length} events`);
});

program.pipe(Effect.provide(EdlinkLive), NodeRuntime.runMain);
```

Set `EDLINK_CLIENT_SECRET` in your environment — that's the only required variable. The SDK reads it via Effect's `Config` module (auto-redacted as `Secret.Secret` in logs).

---

## Runtime Compatibility

The SDK itself is **runtime-agnostic** — it uses `FetchHttpClient` (global `fetch`) and ESM. Only the _runner_ changes per platform.

### Node.js (>= 18)

```bash
pnpm add @effect/platform-node
```

```ts
import { NodeRuntime } from "@effect/platform-node";
program.pipe(Effect.provide(EdlinkLive), NodeRuntime.runMain);
```

### Bun

```bash
bun add @effect/platform-bun
```

```ts
import { BunRuntime } from "@effect/platform-bun";
program.pipe(Effect.provide(EdlinkLive), BunRuntime.runMain);
```

### Deno

```ts
import { Effect } from "npm:effect";
import { EdlinkClient, EdlinkLive } from "npm:@tvsudhir2/edlink-effect-sdk";

// Use Effect.runPromise directly — Deno has global fetch
Effect.runPromise(program.pipe(Effect.provide(EdlinkLive)));
```

---

## API Overview

The `EdlinkClient` service exposes **13 namespaced sub-services** + an events stream:

```ts
const client = yield* EdlinkClient;

client.districts.list();                      // → Stream<District>
client.schools.fetch(id);                     // → Effect<School>
client.people.listEnrollments(personId);      // → Stream<Enrollment>

client.assignments.create(classId, body);     // → Effect<Assignment>
client.assignments.update(classId, id, body); // → Effect<Assignment>
client.assignments.delete(classId, id);       // → Effect<void>
```

### Supported Entities

| Entity | List | Fetch | Create | Update | Delete |
|---|:---:|:---:|:---:|:---:|:---:|
| Districts | ✓ | ✓ | | | |
| Schools | ✓ | ✓ | | | |
| Courses | ✓ | ✓ | | | |
| Sessions | ✓ | ✓ | | | |
| Sections | ✓ | ✓ | | | |
| Classes | ✓ | ✓ | | | |
| People | ✓ | ✓ | | | |
| Enrollments | ✓ | ✓ | | | |
| Agents | ✓ | ✓ | | | |
| Licenses | ✓ | | | | |
| **Assignments** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Categories** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Submissions** | ✓ | ✓ | ✓ | ✓ | |
| Events | ✓ | | | | |

<details>
<summary>Nested endpoints (drill-down queries)</summary>

Many entities support nested listing — for example:
- `client.schools.listClasses(schoolId)` / `listCourses` / `listTeachers` / `listStudents`
- `client.classes.listSections(classId)` / `listEnrollments` / `listPeople`
- `client.people.listDistricts(personId)` / `listSchools` / `listClasses` / `listAgents`
- `client.sections.listEnrollments(sectionId)` / `listTeachers` / `listStudents`
- `client.districts.listAdministrators(districtId)`

All nested endpoints also return `Stream` with configurable pagination.
</details>

---

## Working with Streams

All `list*` methods return `Stream.Stream<Entity, EdlinkApiError | EdlinkDecodeError>` — a **lazy, pull-based** stream. Pages are only fetched when downstream consumers demand more items. This is a core [Effect Stream](https://effect.website/docs/stream/introduction) pattern.

### Collect to an Array

Best for small datasets. Pulls all pages into memory at once.

```ts
const schools = yield* client.schools
  .list()
  .pipe(Stream.runCollect, Effect.map(Chunk.toArray));
// schools: School[]
```

### Process One-by-One (Constant Memory)

Best for large datasets. Each item is processed and discarded — memory stays flat.

```ts
yield* Stream.runForEach(client.events.list(), (event) =>
  Effect.log(`${event.type}: ${event.id}`)
);
```

### Transform Pipelines

Compose `Stream` operators for filtering, mapping, and batching before consumption.

```ts
const activeTeachers = client.people
  .list()
  .pipe(
    Stream.filter((p) => p.roles.includes("teacher")),
    Stream.take(100),
  );

const names = yield* activeTeachers.pipe(
  Stream.map((p) => p.display_name),
  Stream.runCollect,
  Effect.map(Chunk.toArray),
);
```

> **Tip:** Streams are lazy — `Stream.filter` and `Stream.take` don't fetch extra pages once the downstream limit is reached.

---

## Pagination

Every `list*` method accepts an optional `PaginationConfig` — a discriminated union with three strategies:

### 1. Cap by Pages (default)

```ts
client.districts.list({ type: "pages", maxPages: 5 })
```

Stops after `N` pages. **Default is 3 pages** if no config is provided (controlled by `EDLINK_DEFAULT_MAX_PAGES`).

### 2. Cap by Record Count

```ts
client.events.list({ type: "records", maxRecords: 50 })
```

Stops at exactly `N` records — the SDK trims the last page if it would overshoot. Good for pagination UIs and batch processing with predictable output sizes.

### 3. Fetch Everything

```ts
client.enrollments.list({ type: "all" })
```

Fetches every available record. **Use with caution** on entities that may have thousands of rows. Combine with `Stream.runForEach` for constant-memory processing on large datasets.

### How It Works Under the Hood

The SDK uses `Stream.unfoldEffect` with a cursor-based loop. Each iteration:
1. Checks if the pagination limit has been reached
2. Fetches the next page via HTTP
3. Decodes the response through Effect Schema
4. Emits items and advances the cursor

Pages are fetched **lazily** — if you `Stream.take(10)` from a large dataset, only enough pages to fill 10 items are requested.

---

## Examples

The repo includes 7 runnable examples covering the most common patterns. Clone the repo, set up `.env.local`, and run them to see the SDK in action.

### Setup

```bash
git clone https://github.com/tvsudhir2/edlink-effect-sdk.git
cd edlink-effect-sdk && pnpm install

cp .env.example .env.local
# Edit .env.local → set EDLINK_CLIENT_SECRET
# For examples 4–7, also set CLASS_ID
# For examples 6–7, also set ASSIGNMENT_ID
```

### Fetching Data (Examples 1–3)

| # | Run | What It Does | Best For | Limitations |
|---|---|---|---|---|
| **1** | `pnpm ex-1` | Fetch events with default 3-page limit; collects to an array | First-time setup, quick sanity check that your credentials work | Loads all items into memory; uses default pagination only |
| **2** | `pnpm ex-2` | Fetch exactly 50 events using `{ type: "records", maxRecords: 50 }` | Batch processing, pagination UIs, predictable output sizes | Still collects everything in memory |
| **3** | `pnpm ex-3` | Process events one-by-one via `Stream.runForEach` with a `Ref` counter | Large datasets, ETL pipelines, memory-constrained environments | Slightly more complex code; still uses default 3-page limit (pass `{ type: "all" }` for unlimited streaming) |

**Choosing between 1 / 2 / 3:**
- Need a quick array of items? → **Example 1**
- Need a specific number of records? → **Example 2**
- Need to process a large dataset without loading everything into memory? → **Example 3**

### CRUD Operations (Examples 4–7)

| # | Run | What It Does | Best For | Limitations |
|---|---|---|---|---|
| **4** | `pnpm ex-4` | List assignments for a class using `client.assignments.list(classId)` | Viewing class assignments, reading nested/scoped resources | Requires `CLASS_ID` env var; collects all results into memory |
| **5** | `pnpm ex-5` | Create a new assignment with a full request body (title, points, due date, etc.) | LMS integrations that create homework/quizzes programmatically | The request body is passed as a plain object — see the example for all available fields |
| **6** | `pnpm ex-6` | Fetch-then-update pattern: reads an assignment, patches its title/points/due date | Extending deadlines, adjusting point values, partial updates | Requires both `CLASS_ID` and `ASSIGNMENT_ID`; two sequential API calls |
| **7** | `pnpm ex-7` | Verify-then-delete pattern: fetches an assignment to confirm it exists, then deletes it | Cleaning up drafts or cancelled assignments | Requires both `CLASS_ID` and `ASSIGNMENT_ID`; no undo — deletion is permanent |

**Choosing between 4 / 5 / 6 / 7:**
- Need to read entities scoped to a parent? → **Example 4**
- Need to create a new resource? → **Example 5**
- Need to partially update a resource? → **Example 6**
- Need to delete a resource? → **Example 7**

### What the Examples Don't Cover

- **Error handling** — none of the examples use `Effect.catchTag` for recovery. See [Error Handling](#error-handling) below for patterns.
- **User API (OAuth2)** — no runnable examples yet. See [User API](#user-api-oauth2) for usage.
- **`{ type: "all" }` pagination** — Example 3 uses default 3-page limit. Pass `{ type: "all" }` as the pagination config to stream everything.

---

## User API (OAuth2)

For per-user actions (e.g. fetching a student's own profile), the SDK provides an OAuth2 authorization code flow via `EdlinkUserClient`.

```ts
import { Effect } from "effect";
import { EdlinkUserClient, EdlinkUserLive } from "@tvsudhir2/edlink-effect-sdk";

const program = Effect.gen(function* () {
  const userClient = yield* EdlinkUserClient;

  // 1. Generate the authorization URL — redirect your user here
  const authUrl = userClient.authorize(["roster:read"]);

  // 2. After consent, exchange the callback code for tokens
  const tokenResponse = yield* userClient.handleCallback(code);

  // 3. Fetch the user's profile (auto-refreshes token if expired)
  const profile = yield* userClient.getProfile(userId);
});

program.pipe(Effect.provide(EdlinkUserLive));
```

**Required env vars:** `EDLINK_CLIENT_ID`, `EDLINK_CLIENT_SECRET`, `EDLINK_REDIRECT_URI`

**Token storage** is pluggable. The SDK ships `InMemoryTokenStoreLive` for development. For production, provide your own `Layer<TokenStore>` backed by Redis, a database, or any persistent store:

```ts
import { Layer } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { EdlinkUserClientLive, EdlinkUserConfig } from "@tvsudhir2/edlink-effect-sdk";

const MyUserLive = EdlinkUserClientLive.pipe(
  Layer.provide(EdlinkUserConfig.Live),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(MyRedisTokenStoreLive), // your implementation
);
```

> **No runnable examples yet** — contributions welcome.

---

## Error Handling

The SDK exposes two tagged error types. Both extend `Data.TaggedError`, so you can use Effect's `catchTag` for selective recovery.

| Error | When |
|---|---|
| `EdlinkApiError` | HTTP failure, non-OK status, network error |
| `EdlinkDecodeError` | API response doesn't match the expected schema |

```ts
import { Effect } from "effect";
import { EdlinkApiError, EdlinkDecodeError } from "@tvsudhir2/edlink-effect-sdk";

yield* client.schools.fetch(id).pipe(
  Effect.catchTag("EdlinkApiError", (err) =>
    Effect.logError(`API error: ${err.message}`)
  ),
  Effect.catchTag("EdlinkDecodeError", (err) =>
    Effect.logError(`Unexpected response shape: ${err.message}`)
  ),
);
```

Schema validation happens at the boundary — if the Edlink API returns malformed data, you get an `EdlinkDecodeError` immediately instead of a silent type mismatch downstream.

---

## Configuration

All config is loaded via Effect's `Config` module — zero `process.env` usage.

### Graph API

| Variable | Required | Default | Description |
|---|---|---|---|
| `EDLINK_CLIENT_SECRET` | **yes** | — | Bearer token for the Edlink API (stored as `Secret.Secret`) |
| `EDLINK_API_BASE_URL` | no | `https://ed.link/api` | API base URL |
| `EDLINK_DEFAULT_MAX_PAGES` | no | `3` | Default page limit when no `PaginationConfig` is given |

### User API (OAuth2)

| Variable | Required | Default | Description |
|---|---|---|---|
| `EDLINK_CLIENT_ID` | **yes** | — | OAuth2 client ID |
| `EDLINK_CLIENT_SECRET` | **yes** | — | OAuth2 client secret |
| `EDLINK_REDIRECT_URI` | **yes** | — | OAuth2 redirect URI |

> **Tip:** For local development, pass env vars via `tsx --env-file=.env.local` (like the examples do). In production, use your platform's native secret management.

---

## TypeScript

- Ships with `.d.ts` declarations — no separate `@types/` package needed.
- Compiled to **ES2022** with `NodeNext` module resolution.
- **ESM only** — no CommonJS build.
- Strict mode enabled: `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`.

---

## Contributing

Contributions, bug reports, and feature requests are welcome. Please open an issue on [GitHub](https://github.com/tvsudhir2/edlink-effect-sdk/issues) before submitting a PR.

```bash
git clone https://github.com/tvsudhir2/edlink-effect-sdk.git
cd edlink-effect-sdk && pnpm install
pnpm build
```

---

## Changelog

See [GitHub Releases](https://github.com/tvsudhir2/edlink-effect-sdk/releases) for version history.

## License

MIT
