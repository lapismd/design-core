import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parse } from "jsonc-parser";
import { initializeDocsMcp } from "./init.js";

const roots: string[] = [];

function fixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), "docs-mcp-init-"));
  roots.push(root);
  mkdirSync(path.join(root, ".cursor"), { recursive: true });
  writeFileSync(
    path.join(root, "package.json"),
    '{\n  "name": "@acme/catalog",\n  "scripts": {}\n}\n',
  );
  writeFileSync(
    path.join(root, ".cursor/mcp.json"),
    '{\n  // Keep this comment.\n  "mcpServers": {\n    "existing": { "url": "http://localhost:1/mcp" }\n  }\n}\n',
  );
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("docs-mcp init", () => {
  it("generates stdio config and merges detected JSONC clients idempotently", () => {
    const root = fixture();
    const first = initializeDocsMcp({ root });
    expect(first.clientName).toBe("acme-catalog-docs");
    const clientPath = path.join(root, ".cursor/mcp.json");
    const firstText = readFileSync(clientPath, "utf8");
    expect(firstText).toContain("// Keep this comment.");
    const parsed = parse(firstText) as {
      mcpServers: Record<string, { command: string; args: string[] }>;
    };
    expect(parsed.mcpServers.existing).toBeDefined();
    expect(parsed.mcpServers["acme-catalog-docs"]).toMatchObject({
      command: "pnpm",
      args: expect.arrayContaining(["docs-mcp", "stdio"]),
    });
    const second = initializeDocsMcp({ root });
    expect(second.clientFiles).toEqual(first.clientFiles);
    expect(readFileSync(clientPath, "utf8")).toBe(firstText);
  });

  it("refuses to overwrite a conflicting client entry", () => {
    const root = fixture();
    initializeDocsMcp({ root });
    expect(() => initializeDocsMcp({ root, transport: "http" })).toThrow(
      /different definition/,
    );
  });
});
