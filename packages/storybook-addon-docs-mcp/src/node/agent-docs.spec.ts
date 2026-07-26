import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDocsService } from "../service.js";
import type { DocsMcpConfig } from "../types.js";
import {
  AGENT_DOCS_END,
  AGENT_DOCS_START,
  inspectManagedAgentDocs,
  removeManagedAgentDocs,
  resolveAgentDocsPath,
  writeManagedAgentDocs,
} from "./agent-docs.js";

const roots: string[] = [];

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "docs-mcp-agent-docs-"));
  roots.push(root);
  const config: DocsMcpConfig = {
    provider: {
      name: "fixture",
      version: "2.0.0",
      sourceFiles: () => [],
      load: () => ({
        project: {
          title: "Fixture UI",
          guidance: {
            setup: ["Install dependencies."],
            readingOrder: ["Read the forms guide."],
            rules: ["Do not invent props."],
          },
        },
        components: [
          {
            id: "button",
            group: "controls",
            slug: "button",
            name: "Button",
            summary: "A button.",
            path: "src/Button.svelte",
            markdown: "# Button\n\nA button.\n",
            sourceFiles: [],
          },
        ],
        documents: [],
      }),
    },
  };
  const service = createDocsService({
    root,
    config,
    configPath: path.join(root, ".storybook/docs-mcp.config.ts"),
    noCache: true,
  });
  return { root, service };
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("managed agent docs", () => {
  it("updates only its marker block and is idempotent", () => {
    const { root, service } = fixture();
    const agentsPath = path.join(root, "AGENTS.md");
    writeFileSync(agentsPath, "# Curated rules\n\nKeep this text.\n");

    const first = writeManagedAgentDocs({ service });
    expect(first).toEqual([
      expect.objectContaining({ changed: true, action: "written" }),
    ]);
    const text = readFileSync(agentsPath, "utf8");
    expect(text).toContain("# Curated rules");
    expect(text).toContain("Keep this text.");
    expect(text).toContain(AGENT_DOCS_START);
    expect(text).toContain("fixture@2.0.0");
    expect(text).toContain("search");
    expect(writeManagedAgentDocs({ service })[0]!.changed).toBe(false);
    expect(readFileSync(agentsPath, "utf8")).toBe(text);

    expect(removeManagedAgentDocs({ root })[0]).toMatchObject({
      action: "removed",
      changed: true,
    });
    const removed = readFileSync(agentsPath, "utf8");
    expect(removed).toContain("# Curated rules");
    expect(removed).not.toContain(AGENT_DOCS_START);
  });

  it("creates all agent targets and reports stale managed content", () => {
    const { root, service } = fixture();
    const written = writeManagedAgentDocs({ service, agent: "all" });
    expect(written).toHaveLength(3);
    const cursor = readFileSync(
      path.join(root, ".cursor/rules/docs-mcp.mdc"),
      "utf8",
    );
    expect(cursor).toContain("alwaysApply: true");

    const agentsPath = path.join(root, "AGENTS.md");
    writeFileSync(
      agentsPath,
      readFileSync(agentsPath, "utf8").replace("1 components", "9 components"),
    );
    expect(inspectManagedAgentDocs(service)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: "stale" }),
        expect.objectContaining({ status: "current" }),
      ]),
    );
  });

  it("rejects lexical and symlink escapes and malformed markers", () => {
    const { root, service } = fixture();
    expect(() => resolveAgentDocsPath(root, "../outside.md")).toThrow(
      /inside project root/,
    );
    const outside = mkdtempSync(path.join(tmpdir(), "docs-mcp-outside-"));
    roots.push(outside);
    mkdirSync(path.join(root, ".cursor"), { recursive: true });
    symlinkSync(outside, path.join(root, ".cursor/rules"));
    expect(() =>
      resolveAgentDocsPath(root, ".cursor/rules/docs-mcp.mdc"),
    ).toThrow(/symlink/);

    writeFileSync(path.join(root, "AGENTS.md"), `${AGENT_DOCS_START}\n`);
    expect(() => writeManagedAgentDocs({ service })).toThrow(
      /markers are incomplete/,
    );
    expect(readFileSync(path.join(root, "AGENTS.md"), "utf8")).not.toContain(
      AGENT_DOCS_END,
    );
  });
});
