import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { experimental_devServer } from "./preset.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

afterEach(() => vi.restoreAllMocks());

describe("Storybook preset", () => {
  it("advertises Storybook's public port instead of Vite's default", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    let mounted = false;
    await experimental_devServer(
      {
        use() {
          mounted = true;
        },
      },
      {
        port: 9109,
        configDir: path.join(packageRoot, ".storybook"),
        config: ".storybook/docs-mcp.config.ts",
        noCache: true,
      },
    );
    expect(mounted).toBe(true);
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("http://localhost:9109/docs-mcp"),
    );
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("5173"));
  });
});
