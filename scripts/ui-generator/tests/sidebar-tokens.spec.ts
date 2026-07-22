import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sidebarTokenNames } from "../../../src/shared/shadcn/sidebar/sidebar.tokens.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("sidebar tokens vs emitted CSS", () => {
  it("every sidebarTokenNames entry is defined in theme or injected by Provider", () => {
    const theme = readFileSync(path.join(packageRoot, "src/theme.css"), "utf8");
    const provider = readFileSync(
      path.join(
        packageRoot,
        "src/shared/shadcn/sidebar/sidebar-provider.svelte",
      ),
      "utf8",
    );
    const css = readFileSync(
      path.join(packageRoot, "src/shared/shadcn/sidebar/sidebar.svelte"),
      "utf8",
    );

    const widthTokens = new Set([
      sidebarTokenNames.width,
      sidebarTokenNames.widthIcon,
    ]);

    for (const token of Object.values(sidebarTokenNames)) {
      if (widthTokens.has(token)) {
        expect(provider).toContain(token);
        expect(css).toContain(`var(${token})`);
        continue;
      }
      // Theme colors (including primary*, used by apps / theming docs).
      expect(theme).toContain(`${token}:`);
    }
  });

  it("emitted sidebar CSS uses the color tokens declared in sidebar.tokens.ts", () => {
    const css = readFileSync(
      path.join(packageRoot, "src/shared/shadcn/sidebar/sidebar.svelte"),
      "utf8",
    );
    const requiredInCss = [
      sidebarTokenNames.background,
      sidebarTokenNames.foreground,
      sidebarTokenNames.accent,
      sidebarTokenNames.accentForeground,
      sidebarTokenNames.borderColor,
      sidebarTokenNames.ring,
      sidebarTokenNames.width,
      sidebarTokenNames.widthIcon,
    ];
    for (const token of requiredInCss) {
      expect(css).toContain(`var(${token})`);
    }
  });
});
