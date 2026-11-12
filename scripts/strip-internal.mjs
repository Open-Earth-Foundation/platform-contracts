#!/usr/bin/env node
// Remove paths that are outside the compatibility guarantee (see POLICY.md)
// so the breaking-change check only looks at the public surface.
//
// Usage: node scripts/strip-internal.mjs <in.json> <out.json>

import { readFileSync, writeFileSync } from "node:fs";

const INTERNAL_PREFIXES = [
  "/api/v1/internal/",
  "/api/v1/cron/",
  "/api/v1/admin/",
  "/api/v1/mock",
];

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: strip-internal.mjs <in.json> <out.json>");
  process.exit(2);
}

const spec = JSON.parse(readFileSync(input, "utf8"));
for (const path of Object.keys(spec.paths ?? {})) {
  if (INTERNAL_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    delete spec.paths[path];
  }
}
writeFileSync(output, JSON.stringify(spec, null, 2));
