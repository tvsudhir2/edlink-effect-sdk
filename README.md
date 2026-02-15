# Edlink Effect SDK

Functional, type-safe SDK for the [Edlink](https://ed.link) Graph API and User API — built with [Effect-TS](https://effect.website).

Supports the full **v2** API surface: **13 entity types** (Districts, Schools, Courses, Sessions, Sections, Classes, People, Enrollments, Agents, Licenses, Assignments, Categories, Submissions), **Events**, and an **OAuth2 User API** with pluggable token storage.

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up credentials
cp .env.example .env.local
# Edit .env.local → fill in EDLINK_CLIENT_SECRET (and CLASS_ID for examples 4-7)

# 3. Run an example
pnpm ex-1          # Fetch events — default 3-page limit
pnpm ex-2          # Fetch events — max 50 records
pnpm ex-3          # Process events sequentially (memory-efficient)
pnpm ex-4          # List assignments for a class
pnpm ex-5          # Create an assignment
pnpm ex-6          # Update an assignment
pnpm ex-7          # Delete an assignment
```

## Project structure

```
src/
├── client.ts              # EdlinkClient Context.Tag + EdlinkClientLive layer
├── config.ts              # EdlinkConfig + EdlinkUserConfig services
├── errors.ts              # EdlinkApiError, EdlinkDecodeError
├── index.ts               # Public API barrel export
├── layers.ts              # Composed EdlinkLive + EdlinkUserLive layers
├── pagination.ts          # PaginationConfig union + pure helpers
├── token-store.ts         # TokenStore service + InMemoryTokenStore
├── user-client.ts         # EdlinkUserClient — OAuth2 flow + token management
├── schemas/
│   ├── common.ts          # Enums (Subject, Role, ClassState, …) + Identifier
│   ├── address.ts         # Address value object
│   ├── demographics.ts    # Demographics value object
│   ├── agent.ts           # Agent entity
│   ├── assignment.ts      # Assignment entity
│   ├── attachment.ts      # Attachment value object
│   ├── category.ts        # Category entity
│   ├── class.ts           # EdlinkClass entity
│   ├── course.ts          # Course entity
│   ├── district.ts        # District entity
│   ├── enrollment.ts      # Enrollment entity
│   ├── event.ts           # EdlinkEvent entity
│   ├── license.ts         # License entity
│   ├── person.ts          # Person entity
│   ├── product.ts         # Product entity
│   ├── school.ts          # School entity
│   ├── section.ts         # Section entity
│   ├── session.ts         # Session entity
│   ├── submission.ts      # Attempt + Submission entities
│   ├── token.ts           # TokenResponse, TokenData, UserProfile
│   ├── paginated.ts       # PaginatedResponseSchema factory + 14 pre-built schemas
│   └── index.ts           # Schemas barrel export
└── api/
    └── v2/
        ├── request.ts     # Shared HTTP request helpers
        ├── stream.ts      # Generic paginated stream builder
        ├── agents.ts      # Agents API
        ├── assignments.ts # Assignments CRUD API
        ├── categories.ts  # Categories CRUD API
        ├── classes.ts     # Classes API
        ├── courses.ts     # Courses API
        ├── districts.ts   # Districts API
        ├── enrollments.ts # Enrollments API
        ├── events.ts      # Events API
        ├── licenses.ts    # Licenses API
        ├── oauth.ts       # OAuth2 authorization + token exchange
        ├── people.ts      # People API
        ├── profile.ts     # User profile API (/v2/my/profile)
        ├── schools.ts     # Schools API
        ├── sections.ts    # Sections API
        ├── sessions.ts    # Sessions API
        └── submissions.ts # Submissions CRUD API
examples/
├── 1-fetch-default-pages.ts   # Fetch events — default 3-page limit
├── 2-fetch-max-records.ts     # Fetch events — max 50 records
├── 3-process-sequentially.ts  # Stream-process events one-at-a-time
├── 4-list-assignments.ts      # List assignments for a class
├── 5-create-assignment.ts     # Create an assignment
├── 6-update-assignment.ts     # Update an assignment
└── 7-delete-assignment.ts     # Delete an assignment
```

## Supported entity types

| Entity | List | Fetch | Create | Update | Delete | Nested endpoints |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Districts | ✓ | ✓ | | | | administrators |
| Schools | ✓ | ✓ | | | | classes, courses, sessions, people, administrators, teachers, students |
| Courses | ✓ | ✓ | | | | classes |
| Sessions | ✓ | ✓ | | | | |
| Sections | ✓ | ✓ | | | | enrollments, people, teachers, students |
| Classes | ✓ | ✓ | | | | sections, enrollments, people, teachers, students |
| People | ✓ | ✓ | | | | enrollments, districts, schools, classes, sections, agents |
| Enrollments | ✓ | ✓ | | | | |
| Agents | ✓ | ✓ | | | | |
| Licenses | ✓ | | | | | |
| Assignments | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Categories | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Submissions | ✓ | ✓ | ✓ (submit) | ✓ | | reclaim, return |
| Events | ✓ | | | | | |

All list endpoints return lazy `Stream.Stream` with configurable pagination.

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `EDLINK_CLIENT_SECRET` | **yes** | — | Bearer token / client secret for the Edlink API |
| `EDLINK_API_BASE_URL` | no | `https://ed.link/api` | API base URL |
| `EDLINK_DEFAULT_MAX_PAGES` | no | `3` | Default page limit when no pagination config is given |
| `EDLINK_CLIENT_ID` | yes (User API) | — | OAuth2 client ID (required for `EdlinkUserClient`) |
| `EDLINK_REDIRECT_URI` | yes (User API) | — | OAuth2 redirect URI (required for `EdlinkUserClient`) |
| `CLASS_ID` | examples 4–7 | — | Class ID for assignment examples |
| `ASSIGNMENT_ID` | examples 6–7 | — | Assignment ID for update/delete examples |

Secrets are loaded via `tsx --env-file=.env.local` — zero `process.env` usage. `EDLINK_CLIENT_SECRET` is stored as `Secret.Secret` (auto-redacted in logs).

## Architecture

### Dependency injection

**Graph API** — bearer-token authenticated, for server-to-server integration:

```
EdlinkLive (composed layer)
├── EdlinkClientLive  →  EdlinkClient service
├── EdlinkConfig.Live →  reads EDLINK_CLIENT_SECRET, API_BASE_URL, DEFAULT_MAX_PAGES
└── FetchHttpClient   →  HTTP runtime
```

**User API** — OAuth2 authorization code flow, for per-user actions:

```
EdlinkUserLive (composed layer)
├── EdlinkUserClientLive  →  EdlinkUserClient service
├── EdlinkUserConfig.Live →  reads CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
├── InMemoryTokenStoreLive → TokenStore service (pluggable)
└── FetchHttpClient        →  HTTP runtime
```

Examples call `Effect.provide(EdlinkLive)` to wire everything. For the User API, use `Effect.provide(EdlinkUserLive)`.

### Client sub-services

The `EdlinkClient` exposes each entity group as a namespaced sub-service:

```ts
const client = yield* EdlinkClient;

// List & fetch
client.districts.list();
client.schools.fetch(id);
client.people.listEnrollments(personId);

// CRUD operations (Assignments, Categories, Submissions)
client.assignments.create(classId, body);
client.assignments.update(classId, assignmentId, body);
client.assignments.delete(classId, assignmentId);
```

### User API (OAuth2)

The `EdlinkUserClient` handles the OAuth2 authorization code flow:

```ts
const userClient = yield* EdlinkUserClient;

// 1. Redirect user to Edlink for consent
const authUrl = userClient.authorize(["roster:read"], state);

// 2. Exchange the code on callback
const tokenResponse = yield* userClient.handleCallback(code);

// 3. Use the access token (auto-refreshes if expired)
const profile = yield* userClient.getProfile(userId);
const token = yield* userClient.getAccessToken(userId);
```

The `TokenStore` is pluggable — the SDK ships with `InMemoryTokenStoreLive` for development. For production, provide your own `Layer<TokenStore>` (Redis, database, etc.).

### Pagination

Three strategies via a discriminated union:

```ts
{ type: "pages",   maxPages: 3 }    // cap by pages
{ type: "records", maxRecords: 50 }  // cap by record count
{ type: "all" }                      // fetch everything
```

The stream uses `Stream.unfoldEffect` with cursor-based pagination — pages are fetched lazily as downstream consumers pull items.

### Schema validation

API responses are decoded through Effect Schema at the boundary. If the Edlink API returns malformed data, you get an `EdlinkDecodeError` immediately instead of a silent type-mismatch downstream.

### Versioning

Version-specific logic lives in `src/api/v2/`. When Edlink releases v3:

1. Create `src/api/v3/` with the new endpoint paths and any schema changes
2. Update `src/client.ts` to delegate to v3 (or accept a version parameter)
3. No downstream consumer code needs to change

## License

MIT
