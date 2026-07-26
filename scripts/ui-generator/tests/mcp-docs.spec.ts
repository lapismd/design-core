import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createDocsCache } from "../mcp/cache.js";
import { createDocsService } from "../mcp/docs-service.js";
import { extractPropsFromSvelteFile } from "../mcp/svelte-props.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("svelte props extractor", () => {
  it("extracts ButtonProps with defaults and HTML extension note", () => {
    const buttonPath = path.join(
      packageRoot,
      "src/shared/shadcn/button/button.svelte",
    );
    const docgen = extractPropsFromSvelteFile(buttonPath, "Button");
    expect(docgen).toBeDefined();
    expect(docgen!.displayName).toBe("Button");
    expect(docgen!.extendsNote).toMatch(/HTMLButtonAttributes/);
    expect(docgen!.props.variant).toMatchObject({
      required: false,
      defaultValue: { value: '"default"', computed: false },
    });
    expect(docgen!.props.size?.defaultValue?.value).toBe('"default"');
    expect(docgen!.props.dataUiComponent?.description).toMatch(/restyle/i);
  });

  it("extracts FormField inline $props() types and defaults", () => {
    const fieldPath = path.join(
      packageRoot,
      "src/shared/forms/form-field/FormField.svelte",
    );
    const docgen = extractPropsFromSvelteFile(fieldPath, "FormField");
    expect(docgen).toBeDefined();
    expect(docgen!.props.label).toMatchObject({ required: true });
    expect(docgen!.props.align).toMatchObject({
      required: false,
      defaultValue: { value: '"middle"', computed: false },
      tsType: { name: '"start" | "center" | "middle"' },
    });
    expect(docgen!.props.as?.defaultValue?.value).toBe('"label"');
    expect(docgen!.props.children?.tsType.name).toMatch(/Snippet/);
  });
});

describe("docs cache", () => {
  it("hits on unchanged fingerprint and misses after content change", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "ui-docs-cache-"));
    const file = path.join(dir, "source.txt");
    writeFileSync(file, "alpha", "utf8");
    const cache = createDocsCache({ disabled: false });

    let builds = 0;
    const build = () => {
      builds += 1;
      return { n: builds };
    };

    const first = cache.get("k", [file], build);
    expect(first.cacheHit).toBe(false);
    expect(first.value.n).toBe(1);

    const second = cache.get("k", [file], build);
    expect(second.cacheHit).toBe(true);
    expect(second.value.n).toBe(1);
    expect(builds).toBe(1);

    writeFileSync(file, "beta", "utf8");
    const third = cache.get("k", [file], build);
    expect(third.cacheHit).toBe(false);
    expect(third.value.n).toBe(2);

    rmSync(dir, { recursive: true, force: true });
  });

  it("persists to disk and reloads with a fresh cache instance", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "ui-docs-disk-"));
    const diskRoot = path.join(dir, "cache");
    mkdirSync(diskRoot, { recursive: true });
    const file = path.join(dir, "source.txt");
    writeFileSync(file, "persist-me", "utf8");

    const first = createDocsCache({ diskRoot });
    const a = first.get("disk-key", [file], () => ({ ok: true }));
    expect(a.cacheHit).toBe(false);

    const second = createDocsCache({ diskRoot });
    const b = second.get("disk-key", [file], () => ({ ok: false }));
    expect(b.cacheHit).toBe(true);
    expect(b.value).toEqual({ ok: true });

    rmSync(dir, { recursive: true, force: true });
  });
});

describe("llms docs service", () => {
  const service = createDocsService({
    packageRoot,
    baseUrl: "http://127.0.0.1:9011",
    noCache: true,
  });

  it("builds an llms.txt index with layered component links", () => {
    const index = service.buildLlmsIndex();
    expect(index).toContain("# @stevejuma/ui");
    expect(index).toContain("## shadcn");
    expect(index).toContain(
      "[Button](http://127.0.0.1:9011/llms/shadcn/button.md)",
    );
    expect(index).toContain(
      "([txt](http://127.0.0.1:9011/llms/shadcn/button.txt))",
    );
    expect(index).toContain("## forms");
    expect(index).toContain(
      "[FormField](http://127.0.0.1:9011/llms/forms/form-field.md)",
    );
    expect(index).toContain("## guide");
    expect(index).toMatch(/llms\/guide\/layers\.md/);
    expect(index).toMatch(/llms\/guide\/layers\.txt/);
  });

  it("resolves qualified and bare component paths as .md and .txt", () => {
    const qualifiedMd = service.resolveLlmsPath("/llms/shadcn/button.md");
    expect(qualifiedMd.status).toBe(200);
    expect(qualifiedMd.contentType).toBe("text/html; charset=utf-8");
    expect(qualifiedMd.body).toContain("<!doctype html>");
    expect(qualifiedMd.body).toContain("<h1>Button</h1>");
    expect(qualifiedMd.body).toContain("<h2>Props</h2>");
    expect(qualifiedMd.body).toContain("<table>");
    expect(qualifiedMd.body).toContain("<code>variant</code>");
    expect(qualifiedMd.body).toContain('class="hljs language-typescript"');
    expect(qualifiedMd.body).toMatch(/hljs-keyword|hljs-string|hljs-title/);

    const qualifiedTxt = service.resolveLlmsPath("/llms/shadcn/button.txt");
    expect(qualifiedTxt.status).toBe(200);
    expect(qualifiedTxt.contentType).toBe("text/plain; charset=utf-8");
    expect(qualifiedTxt.body).toContain("# Button");
    expect(qualifiedTxt.body).toContain("## Props");
    expect(qualifiedTxt.body).toContain("`variant`");

    const bare = service.resolveLlmsPath("/llms/button.md");
    expect(bare.status).toBe(200);
    expect(bare.contentType).toBe("text/html; charset=utf-8");
    expect(bare.body).toContain("<h1>Button</h1>");

    const field = service.resolveLlmsPath("/llms/forms/form-field.md");
    expect(field.status).toBe(200);
    expect(field.body).toContain("<h1>FormField</h1>");
    expect(field.body).toContain("<code>label</code>");

    const indexMd = service.resolveLlmsPath("/llms.md");
    expect(indexMd.status).toBe(200);
    expect(indexMd.contentType).toBe("text/html; charset=utf-8");
    expect(indexMd.body).toContain("<h1>@stevejuma/ui</h1>");
    expect(indexMd.body).toContain(
      'href="http://127.0.0.1:9011/llms/shadcn/button.md"',
    );
  });

  it("serves guide topics and components.json manifest", () => {
    const guide = service.resolveLlmsPath("/llms/guide/layers.md");
    expect(guide.status).toBe(200);
    expect(guide.contentType).toBe("text/html; charset=utf-8");
    expect(guide.body).toMatch(/<h1>/i);
    expect(guide.body).toMatch(/layer/i);

    const manifest = service.buildComponentsManifest();
    expect(manifest.v).toBe(0);
    expect(manifest.components["shadcn-button"]).toMatchObject({
      id: "shadcn-button",
      name: "Button",
    });
    const button = manifest.components["shadcn-button"] as {
      reactDocgen?: { props: Record<string, unknown> };
    };
    expect(button.reactDocgen?.props.variant).toBeDefined();
  });
});
