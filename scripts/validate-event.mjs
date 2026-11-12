#!/usr/bin/env node
// Validate webhook envelopes against the v1 event schemas.
//
// Usage:
//   node scripts/validate-event.mjs <file.json> [...]   validate given payload files
//   node scripts/validate-event.mjs --examples          validate the bundled examples
//
// Each file holds one envelope or an array of envelopes. The schema is picked
// from envelope.type via events/v1/catalog.json. Exits 1 on any failure.
//
// Also importable: `import { validateEvent } from ".../validate-event.mjs"`.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const eventsDir = join(root, "events", "v1");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

const catalog = readJson(join(eventsDir, "catalog.json"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const file of readdirSync(eventsDir).filter((f) => f.endsWith(".schema.json"))) {
  ajv.addSchema(readJson(join(eventsDir, file)), file);
}

/** @returns {{ ok: boolean, errors: string[] }} */
export function validateEvent(envelope) {
  const schemaFile = catalog.emitted[envelope?.type];
  if (!schemaFile) {
    return { ok: false, errors: [`unknown or non-emitted event type: ${envelope?.type}`] };
  }
  const validate = ajv.getSchema(schemaFile);
  if (validate(envelope)) return { ok: true, errors: [] };
  return {
    ok: false,
    errors: validate.errors.map((e) => `${e.instancePath || "/"} ${e.message}`),
  };
}

function main(args) {
  const files = args[0] === "--examples"
    ? readdirSync(join(eventsDir, "examples")).map((f) => join(eventsDir, "examples", f))
    : args;
  if (!files.length) {
    console.error("usage: validate-event.mjs <file.json> [...] | --examples");
    process.exit(2);
  }
  let failed = 0;
  for (const file of files) {
    const content = readJson(file);
    for (const envelope of Array.isArray(content) ? content : [content]) {
      const { ok, errors } = validateEvent(envelope);
      if (ok) {
        console.log(`ok    ${file} (${envelope.type})`);
      } else {
        failed++;
        console.error(`FAIL  ${file} (${envelope?.type})\n  ${errors.join("\n  ")}`);
      }
    }
  }
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
