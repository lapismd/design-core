import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createSvelteDocsProvider } from "./provider.js";

const roots: string[] = [];

function fixtureRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "docs-mcp-svelte-"));
  roots.push(root);
  mkdirSync(path.join(root, "src/lib"), { recursive: true });
  writeFileSync(
    path.join(root, "src/lib/Notice.svelte"),
    `<script lang="ts">
  type Props = {
    /** Text shown in the notice. */
    message: string;
    tone?: "info" | "warning";
  };
  let { message, tone = "info" }: Props = $props();
</script>
<p data-tone={tone}>{message}</p>
`,
    "utf8",
  );
  writeFileSync(
    path.join(root, "src/lib/Notice.stories.svelte"),
    `<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Notice from "./Notice.svelte";
  const { Story } = defineMeta({
    title: "Feedback/Notice",
    component: Notice,
    parameters: { docs: { description: { component: "A concise notice." } } },
  });
</script>
<Story name="Default" args={{ message: "Saved" }} />
`,
    "utf8",
  );
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("generic Svelte docs provider", () => {
  it("resolves an explicit component import and extracts props and stories", () => {
    const root = fixtureRoot();
    const provider = createSvelteDocsProvider({ title: "Fixture UI" });
    const catalog = provider.load({ root });
    expect(catalog.project.title).toBe("Fixture UI");
    expect(catalog.warnings).toEqual([]);
    expect(catalog.components).toHaveLength(1);
    expect(catalog.components[0]).toMatchObject({
      id: "feedback-notice",
      group: "feedback",
      slug: "notice",
      name: "Notice",
      summary: "A concise notice.",
    });
    expect(catalog.components[0]!.stories).toEqual([
      expect.objectContaining({ name: "Default" }),
    ]);
    expect(catalog.components[0]!.reactDocgen?.props.message).toMatchObject({
      required: true,
    });
    expect(catalog.components[0]!.markdown).toContain("## Props");
  });

  it("warns instead of guessing when a story has ambiguous components", () => {
    const root = fixtureRoot();
    writeFileSync(path.join(root, "src/lib/Other.svelte"), "<p>Other</p>\n");
    writeFileSync(
      path.join(root, "src/lib/Ambiguous.stories.svelte"),
      `<script module lang="ts">const title = "Ambiguous";</script>\n`,
    );
    const catalog = createSvelteDocsProvider().load({ root });
    expect(catalog.warnings).toEqual([
      expect.stringContaining("Could not resolve a unique component"),
    ]);
  });
});
