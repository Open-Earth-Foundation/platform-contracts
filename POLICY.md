# Versioning and deprecation policy

This repo holds the contracts that other systems build against. A contract here is a promise: once released, it does not change in a way that breaks consumers without warning.

## What is covered

| Contract | File(s) | Covered |
| --- | --- | --- |
| CityCatalyst REST API | `openapi/v1/citycatalyst-api.json` | All `/api/v1` paths **except** the internal prefixes below |
| Webhook events | `events/v1/*.schema.json`, `events/v1/catalog.json` | Envelope, signature headers, and every event listed under `emitted` |

**Not covered** (in the snapshot for reference, but they can change at any time):

- `/api/v1/internal/*`: service-to-service (e.g. Climate Advisor)
- `/api/v1/cron/*`: scheduled jobs
- `/api/v1/admin/*`: OEF admin panel
- `/api/v1/mock`
- Event types listed under `reserved` in `catalog.json` (names are reserved; payloads are not defined until they are emitted)

## Versions

Releases are git tags `vMAJOR.MINOR.PATCH`. Consumers pin a tag.

| Bump | When | Example |
| --- | --- | --- |
| **PATCH** | Docs, descriptions, examples, tooling. No contract change. | Fix a typo in a schema description |
| **MINOR** | Additive, backward-compatible change. | New endpoint, new optional field, new optional query param, new emitted event type, new field inside an event's `data` |
| **MAJOR** | Breaking change. Only after the deprecation window. | Remove or rename an endpoint or field, change a type, make an optional input required, change auth requirements |

A major version gets a new folder (`openapi/v2/`, `events/v2/`). The previous major stays in the repo and keeps being served for the length of the deprecation window.

### What counts as breaking

**REST API:**

- Removing or renaming a path, method, request field, response field, or query param
- Changing a field's type or format, or narrowing an enum in a response
- Making an optional request field or param required, or adding a new required one
- Changing the success status code or error response shape
- Tightening auth (a route that accepted a PAT or OAuth token no longer does)

**Webhook events:**

- Removing, renaming, or changing the type of any field in the envelope or in `data`
- Changing what an event type means or when it fires
- Changing the signature algorithm or header names

Breaking event changes ship as a **new event type** (e.g. `inventory.published.v2`), never as a silent change to the existing one. Both types are emitted during the deprecation window.

### What consumers must tolerate

- Unknown fields in responses and event payloads: ignore them.
- New event types they did not subscribe to: they will not receive them.
- Duplicate webhook deliveries: delivery is at-least-once, so use `id` / `X-CityCatalyst-Delivery` as the idempotency key.

## Deprecation

1. **Mark it.** In the OpenAPI spec set `deprecated: true` and `x-sunset: <YYYY-MM-DD>` on the operation or parameter, and describe the replacement. For an event, add `"deprecated": true` and the sunset date to its schema and list the replacement type. Release as a MINOR.
2. **Signal it at runtime.** Deprecated endpoints return a `Deprecation` header ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745)) and a `Sunset` header ([RFC 8594](https://www.rfc-editor.org/rfc/rfc8594)) with the sunset date.
3. **Announce it.** Add an entry to `CHANGELOG.md` and notify known integrators (DS apps, API clients, webhook subscribers).
4. **Wait.** The minimum deprecation window is **6 months** from the release that marks the item deprecated. Security fixes can shorten it; the reason goes in the changelog.
5. **Remove it.** Release the removal as a MAJOR after the sunset date.

The CI check (`scripts/check-openapi.sh`, using [oasdiff](https://github.com/oasdiff/oasdiff)) rejects removing a path that was not deprecated first.

## How a change flows

1. Change the API or event in CityCatalyst. Its CI runs the contract check against the pinned version of this repo.
2. **Additive change:** CI passes. Open a PR here with the regenerated snapshot (`npm run openapi:build` in `app/`, then copy into `openapi/v1/`) or the updated event schema. Tag a MINOR, then bump the pin in CityCatalyst.
3. **Breaking change:** CI fails, as intended. Follow the deprecation steps above instead.

The snapshot in this repo is the source of truth for consumers. CityCatalyst is checked against it, not the other way round.
