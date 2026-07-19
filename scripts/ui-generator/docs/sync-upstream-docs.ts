import { createHash } from "node:crypto";
import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import { emitDocsArtifacts } from "./emit-docs-artifacts.js";
import { fetchUpstreamDocsMarkdown } from "./fetch-upstream-docs.js";
import { parseUpstreamDocs } from "./parse-upstream-docs.js";
import {
  isRewrittenExample,
  rewriteExample,
} from "./rewrite-example.js";
import type { SyncUpstreamDocsResult } from "./types.js";

export function listShadcnFamilies(sharedRoot: string): Set<string> {
  if (!existsSync(sharedRoot)) return new Set();
  return new Set(
    readdirSync(sharedRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function patchProvenance(
  targetDir: string,
  component: string,
  result: SyncUpstreamDocsResult,
): string | null {
  const provenancePath = path.join(
    targetDir,
    `${component}.provenance.json`,
  );
  if (!existsSync(provenancePath)) return null;
  const raw = JSON.parse(readFileSync(provenancePath, "utf8")) as {
    upstream?: Record<string, unknown>;
  };
  raw.upstream = {
    ...(raw.upstream ?? {}),
    docsUrl: result.docsUrl,
    docsFetchedAt: result.docsFetchedAt,
    docsSha256: result.docsSha256,
    examplesIncluded: result.examplesIncluded,
    examplesSkipped: result.examplesSkipped,
  };
  writeFileSync(provenancePath, `${JSON.stringify(raw, null, 2)}\n`);
  return provenancePath;
}

export async function syncUpstreamDocs(args: {
  component: string;
  targetDir: string;
  storyTitle: string;
  sharedRoot: string;
  /** When set, skip network and parse this markdown instead. */
  markdownFixture?: string;
  fetchImpl?: typeof fetch;
}): Promise<SyncUpstreamDocsResult> {
  const {
    component,
    targetDir,
    storyTitle,
    sharedRoot,
    markdownFixture,
    fetchImpl,
  } = args;

  if (!existsSync(targetDir)) {
    throw new GeneratorError(
      `Target directory missing for ${component}`,
      EXIT.generation,
      targetDir,
    );
  }

  log.step(`Syncing upstream docs for ${component}`);

  let url: string;
  let markdown: string;
  if (markdownFixture) {
    markdown = readFileSync(markdownFixture, "utf8");
    url = `fixture:${markdownFixture}`;
  } else {
    const fetched = await fetchUpstreamDocsMarkdown(component, { fetchImpl });
    url = fetched.url;
    markdown = fetched.markdown;
  }

  const docs = parseUpstreamDocs(component, markdown);
  docs.docsUrl = url.startsWith("fixture:")
    ? `https://shadcn-svelte.com/docs/components/${component}.md`
    : url;

  const available = listShadcnFamilies(sharedRoot);
  const included = [];
  const skipped = [];

  for (const example of docs.examples) {
    const result = rewriteExample({
      component,
      example,
      availableFamilies: available,
    });
    if (isRewrittenExample(result)) {
      included.push(result);
    } else {
      skipped.push(result);
      log.warn(
        `Skipping example "${example.name}": ${result.reason} (${result.detail})`,
      );
    }
  }

  const written = emitDocsArtifacts({
    targetDir,
    component,
    storyTitle,
    docs,
    examples: included,
  });

  const result: SyncUpstreamDocsResult = {
    component,
    docsUrl: docs.docsUrl,
    docsSha256: sha256(markdown),
    docsFetchedAt: new Date().toISOString(),
    written,
    examplesIncluded: included.map((e) => e.example.name),
    examplesSkipped: skipped.map((s) => ({
      name: s.example.name,
      reason: s.reason,
      detail: s.detail,
    })),
  };

  const provenancePath = patchProvenance(targetDir, component, result);
  if (provenancePath) written.push(provenancePath);

  log.ok(
    `${component} docs: ${included.length} examples, ${skipped.length} skipped`,
  );
  return result;
}
