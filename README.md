# platform-contracts

Versioned contracts for the CityCatalyst platform. Services and apps build against a pinned release of this repo instead of whatever CityCatalyst happens to do today.

| Contract | Location |
| --- | --- |
| REST API (`/api/v1`) | [`openapi/v1/citycatalyst-api.json`](openapi/v1/citycatalyst-api.json) |
| Webhook envelope and events | [`events/v1/`](events/v1/) ([catalog](events/v1/catalog.json), [examples](events/v1/examples/)) |
| Versioning and deprecation rules | [`POLICY.md`](POLICY.md) |

## Using it

Pin a tag (for example `v1.0.0`) and check your system against it.

**Check an OpenAPI spec for breaking changes** (needs Node 22 and either [`oasdiff`](https://github.com/oasdiff/oasdiff) on `PATH` or Docker):

```bash
scripts/check-openapi.sh path/to/generated-openapi.json
```

Additive changes pass. Removed or renamed paths and fields, type changes, and new required inputs fail. Internal paths are ignored (see [POLICY.md](POLICY.md#what-is-covered)).

**Validate webhook payloads:**

```bash
npm ci
node scripts/validate-event.mjs payload.json [more.json ...]
```

Or from JavaScript:

```js
import { validateEvent } from "platform-contracts/scripts/validate-event.mjs";
const { ok, errors } = validateEvent(envelope);
```

## Developing

```bash
npm ci
npm test   # Spectral lint of the OpenAPI snapshot + validate event examples
```

The v1 OpenAPI snapshot is generated from CityCatalyst (`app/scripts/build-swagger-doc.ts`). `info.x-source` records the app version and commit it was taken from. `info.version` is the contract version and is independent of the app version.
