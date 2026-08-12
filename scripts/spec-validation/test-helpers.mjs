import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export function createFixture(files) {
  const root = mkdtempSync(path.join(os.tmpdir(), "design-core-spec-"));
  for (const [relativePath, source] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, source);
  }
  return root;
}

export function minimalBook({
  requirement = "DC-GOV-001",
  statement = "The fixture MUST remain valid.",
  details = [
    "The first outcome is observable.",
    "The second outcome is observable.",
  ],
  status = "Implemented",
} = {}) {
  const chapter = `# Chapter

## Public surface coverage

| Surface | Public boundary | Requirement |
| --- | --- | --- |
| Fixture | Test boundary | ${requirement} |

## ${requirement} — Fixture

**Requirement.** ${statement}

### Acceptance details

${details.map((detail) => `- ${detail}`).join("\n")}
`;
  return {
    "spec/book.toml": '[book]\nsrc = "src"\n\n[build]\nbuild-dir = "book"\n',
    ".gitignore": "spec/book/\n",
    "package.json": JSON.stringify({
      exports: { "./fixture": "./src/index.ts" },
    }),
    "spec/public-surfaces.json": JSON.stringify({
      exports: [{ name: "./fixture", requirement }],
      catalog: [{ name: "Fixture/Test", requirement }],
    }),
    "spec/src/SUMMARY.md":
      "# Summary\n\n- [Chapter](chapter.md)\n- [Verification](verification.md)\n",
    "spec/src/chapter.md": chapter,
    "spec/src/verification.md": `# Verification\n\n| Requirement | Status | Evidence |\n| --- | --- | --- |\n| ${requirement} | ${status} | fixture |\n`,
    "src/Fixture.stories.svelte": `<script module>const { Story } = defineMeta({ title: "Fixture/Test" });</script>`,
  };
}
