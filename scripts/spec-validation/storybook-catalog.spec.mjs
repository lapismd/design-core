import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { validate } from "./storybook-catalog.mjs";

function withSources(sources, callback) {
  const repoRoot = mkdtempSync(path.join(os.tmpdir(), "design-core-source-"));
  try {
    for (const [relativePath, source] of Object.entries(sources)) {
      const absolutePath = path.join(repoRoot, relativePath);
      mkdirSync(path.dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, source);
    }
    callback(validate({ model: { repoRoot } }));
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
}

const demoStory = `
<script module lang="ts">
  import AppShellDemo from "./AppShellDemo.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  const { Story } = defineMeta({ title: "Shell/App Shell", component: AppShellDemo });
</script>
<Story name="Default"><AppShellDemo /></Story>
`;

test("accepts complete consumer source for a local demo boundary", () => {
  withSources(
    {
      "src/AppShell.stories.svelte": `${demoStory}
<!-- parameters.docs.source is explicit consumer code -->
<Story parameters={{ docs: { source: {
  code: exampleSources.Basic,
  language: "svelte",
  type: "code",
} } }} />`,
    },
    (findings) => assert.deepEqual(findings, []),
  );
});

test("reports an Autodocs story-only boundary without explicit source", () => {
  withSources({ "src/AppShell.stories.svelte": demoStory }, (findings) => {
    assert.deepEqual(
      findings.map((finding) => finding.code),
      ["SPEC-STORY-SOURCE-MISSING"],
    );
    assert.equal(findings[0].rule, "DC-GOV-009");
    assert.equal(findings[0].file, "src/AppShell.stories.svelte");
  });
});

test("recognizes story-surface and .story.svelte boundaries", () => {
  withSources(
    {
      "src/Surface.stories.svelte": `
<script module lang="ts">
  import PanelStorySurface from "./Panel.svelte";
</script>`,
      "src/Renderer.stories.svelte": `
<script module lang="ts">
  import CurrencyInput from "./CurrencyInput.story.svelte";
</script>`,
    },
    (findings) =>
      assert.deepEqual(
        findings.map((finding) => finding.code),
        ["SPEC-STORY-SOURCE-MISSING", "SPEC-STORY-SOURCE-MISSING"],
      ),
  );
});

test("requires code, language, and code type on every explicit source", () => {
  withSources(
    {
      "src/Button.stories.svelte": `
<script module lang="ts">
  import ButtonDemo from "./ButtonDemo.svelte";
  const parameters = { docs: { source: { code: "<Button />" } } };
</script>`,
    },
    (findings) => {
      assert.deepEqual(
        findings.map((finding) => finding.code),
        ["SPEC-STORY-SOURCE-FIELDS"],
      );
      assert.equal(findings[0].rule, "DC-CAT-007");
    },
  );
});

test("rejects story-only component names and args in example sources", () => {
  withSources(
    {
      "src/Button.example-sources.ts":
        'export const Basic = "<ButtonHarness value={args.value} />";\n',
    },
    (findings) => {
      assert.deepEqual(
        findings.map((finding) => finding.code),
        ["SPEC-STORY-SOURCE-BOUNDARY"],
      );
      assert.equal(findings[0].rule, "DC-CAT-006");
    },
  );
});

test("allows an intentionally public Demo-suffixed component", () => {
  withSources(
    {
      "src/Framework.example-sources.ts": `export const Basic = \`<script lang="ts">
  import { ReusableFrameworkDemo } from "@lapismd/design-core/workspace/demo";
</script>
<ReusableFrameworkDemo />\`;`,
    },
    (findings) => assert.deepEqual(findings, []),
  );
});

test("checks rendered content behind raw example-source imports", () => {
  withSources(
    {
      "src/Button.example-sources.ts":
        'import Basic from "./ButtonExample.svelte?raw";\nexport { Basic };\n',
      "src/ButtonExample.svelte": "<ButtonFixture />\n",
    },
    (findings) =>
      assert.deepEqual(
        findings.map((finding) => finding.code),
        ["SPEC-STORY-SOURCE-BOUNDARY"],
      ),
  );
});

test("allows direct component stories without redundant source metadata", () => {
  withSources(
    {
      "src/Button.stories.svelte": `
<script module lang="ts">
  import Button from "./Button.svelte";
</script>`,
    },
    (findings) => assert.deepEqual(findings, []),
  );
});

test("exempts stories explicitly excluded from Autodocs", () => {
  withSources(
    {
      "src/Acceptance.stories.svelte": `${demoStory}
<Story tags={["!autodocs", "test"]} />`,
    },
    (findings) => assert.deepEqual(findings, []),
  );
});
