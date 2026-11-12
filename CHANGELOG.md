# Changelog

All notable changes to the contracts. Versioning follows [POLICY.md](POLICY.md).

## v1.0.1 (2026-11-12)

Corrected snapshot. **Use this instead of v1.0.0.**

- **OpenAPI:** regenerated from CityCatalyst `develop` (`7cf2bcb15`). v1.0.0 was taken from a feature branch two days behind `develop`, so it was missing changes already merged there: `POST /api/v1/concept-notes/{runId}/chat/suggestions` removed, `cityIds` removed from the `PATCH /api/v1/user/invites/accept` request, and a new `excluded-reference-unconfirmed` import row-preview issue value. Nothing consumed v1.0.0 before this release.
- **Policy:** adding a value to a response enum is not breaking. Clients must handle unknown values. The breaking-change check reports it as a warning (`oasdiff-severity.txt`).
- **Webhook events:** unchanged.

## v1.0.0 (2026-11-10)

First frozen release (CC-1176).

- **OpenAPI:** snapshot of CityCatalyst `/api/v1` (215 paths) generated from CityCatalyst `1.28.0-dev.0`. Internal prefixes (`/internal`, `/cron`, `/admin`, `/mock`) are in the snapshot but outside the compatibility guarantee.
- **Webhook events:** envelope schema with signature headers. Schemas for the three emitted events: `inventory.published`, `plan.generated`, `datasource.connected`. Five reserved names.
- **Policy:** semver rules, what counts as breaking, and a 6-month minimum deprecation window.
