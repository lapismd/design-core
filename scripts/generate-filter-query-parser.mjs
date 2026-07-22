#!/usr/bin/env node
/**
 * Regenerate the committed Lezer parser for the filter-query language.
 *
 *   pnpm filter:grammar
 */
import { buildParserFile } from "@lezer/generator";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "src/shared/filter/filter-query");
const grammar = readFileSync(join(dir, "query.grammar"), "utf8");
const result = buildParserFile(grammar, {
  fileName: "query.grammar",
  moduleStyle: "es",
});

writeFileSync(join(dir, "query.js"), result.parser);
if (result.terms) {
  writeFileSync(join(dir, "query.terms.js"), result.terms);
}

console.log(
  "Wrote filter-query Lezer parser to src/shared/filter/filter-query/query.js",
);
