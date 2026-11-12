# Changelog

All notable changes to the contracts. Versioning follows [POLICY.md](POLICY.md).

## v1.0.0 (2026-11-10)

First frozen release (CC-1176).

- **OpenAPI:** snapshot of CityCatalyst `/api/v1` (215 paths) generated from CityCatalyst `1.28.0-dev.0`. Internal prefixes (`/internal`, `/cron`, `/admin`, `/mock`) are in the snapshot but outside the compatibility guarantee.
- **Webhook events:** envelope schema with signature headers. Schemas for the three emitted events: `inventory.published`, `plan.generated`, `datasource.connected`. Five reserved names.
- **Policy:** semver rules, what counts as breaking, and a 6-month minimum deprecation window.
