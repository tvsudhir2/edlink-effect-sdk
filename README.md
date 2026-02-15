# Edlink Effect SDK

Functional, type-safe SDK for the [Edlink](https://ed.link) Graph API — built with [Effect-TS](https://effect.website).

Currently supports **events** via the **v2** API. The modular architecture makes it straightforward to add new entity types and API versions.

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up credentials
cp .env.example .env.local
# Edit .env.local → fill in EDLINK_CLIENT_SECRET

# 3. Run an example
pnpm ex-1          # Fetch events — default 3-page limit
pnpm ex-3          # Fetch events — max 50 records
pnpm ex-4          # Process events sequentially (memory-efficient)
```

## Project structure

```
src/
├── config.ts              # EdlinkConfig service (Secret, base URL, max pages)
├── errors.ts              # EdlinkApiError, EdlinkDecodeError
├── pagination.ts          # PaginationConfig union + pure helpers
├── client.ts              # EdlinkClient Context.Tag + EdlinkClientLive layer
├── layers.ts              # Composed EdlinkLive layer (one-liner provision)
├── schemas/
│   └── event.ts           # Effect Schema for events + paginated response factory
└── api/
    └── v2/
        └── events.ts      # V2 stream builder — endpoint path + pagination logic
examples/
├── 1-fetch-default-pages.ts
├── 3-fetch-max-records.ts
└── 4-process-sequentially.ts
```

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `EDLINK_CLIENT_SECRET` | **yes** | — | Bearer token for the Edlink API |
| `EDLINK_API_BASE_URL` | no | `https://ed.link/api` | API base URL |
| `EDLINK_DEFAULT_MAX_PAGES` | no | `3` | Default page limit when no pagination config is given |

Secrets are loaded via `tsx --env-file=.env.local` — zero `process.env` usage. `EDLINK_CLIENT_SECRET` is stored as `Secret.Secret` (auto-redacted in logs).

## Architecture

### Dependency injection

```
EdlinkLive (composed layer)
├── EdlinkClientLive  →  EdlinkClient service
├── EdlinkConfig.Live →  reads env vars via Effect Config
└── FetchHttpClient   →  HTTP runtime
```

Examples call `Effect.provide(EdlinkLive)` to wire everything.

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

1. Create `src/api/v3/events.ts` with the new endpoint path and any schema changes
2. Update `src/client.ts` to delegate to v3 (or accept a version parameter)
3. No downstream consumer code needs to change

## Adding a new entity type

1. **Schema** — create `src/schemas/person.ts` using the `PaginatedResponseSchema` factory
2. **API** — create `src/api/v2/people.ts` with `createPeopleStream`
3. **Client** — add `getPeopleStream` to the `EdlinkClient` interface and `makeEdlinkClient`

## License

MIT
