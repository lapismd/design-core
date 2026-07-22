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
import { loadVendoredDocs } from "./load-vendored-docs.js";
import { parseUpstreamDocs } from "./parse-upstream-docs.js";
import {
  isRewrittenExample,
  rewriteExample,
} from "./rewrite-example.js";
import type { SyncUpstreamDocsResult } from "./types.js";
import { VENDOR_DOCS_RELATIVE } from "./vendor-docs.js";

export function listShadcnFamilies(sharedRoot: string): Set<string> {
  if (!existsSync(sharedRoot)) return new Set();
  return new Set(
    readdirSync(sharedRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );
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
    docsCommit: result.docsCommit,
    docsRef: result.docsRef,
    docsVendorPath: result.docsVendorPath,
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
  packageRoot: string;
  /**
   * Offline LLM-markdown fixture (legacy parse path). Prefer vendored fixtures
   * under scripts/ui-generator/fixtures/vendored-docs for new tests.
   */
  markdownFixture?: string;
  /** Override vendor root (tests). */
  vendorRoot?: string;
}): Promise<SyncUpstreamDocsResult> {
  const {
    component,
    targetDir,
    storyTitle,
    sharedRoot,
    packageRoot,
    markdownFixture,
    vendorRoot,
  } = args;

  if (!existsSync(targetDir)) {
    throw new GeneratorError(
      `Target directory missing for ${component}`,
      EXIT.generation,
      targetDir,
    );
  }

  log.step(`Syncing upstream docs for ${component}`);

  let docs;
  let docsSha256: string;
  let docsCommit: string | undefined;
  let docsRef: string | undefined;
  let docsVendorPath: string | undefined;

  if (markdownFixture) {
    const markdown = readFileSync(markdownFixture, "utf8");
    docs = parseUpstreamDocs(component, markdown);
    docs.docsUrl = `https://shadcn-svelte.com/docs/components/${component}.md`;
    const { createHash } = await import("node:crypto");
    docsSha256 = createHash("sha256").update(markdown).digest("hex");
  } else {
    const loaded = loadVendoredDocs({
      packageRoot,
      component,
      vendorRoot,
    });
    docs = loaded.docs;
    docsSha256 = loaded.contentSha256;
    docsCommit = loaded.pin.commit;
    docsRef = loaded.pin.ref;
    docsVendorPath = VENDOR_DOCS_RELATIVE;
    if (loaded.skippedBlocks.length) {
      log.warn(
        `${component}: skipping ${loaded.skippedBlocks.length} multi-file block preview(s): ${loaded.skippedBlocks.join(", ")}`,
      );
    }
  }

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
    docsSha256,
    docsFetchedAt: new Date().toISOString(),
    docsCommit,
    docsRef,
    docsVendorPath,
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
