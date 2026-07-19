import { describe, expect, it } from "vitest";
import {
  extractTvConfig,
  splitCandidates,
} from "../analysis/variant-extractor.js";
import { publicTokenName } from "../transform/token-names.js";
import { validatePatchPaths } from "../adapters/git.js";
import { EXIT, GeneratorError } from "../errors.js";

const sample = `
export const buttonVariants = tv({
  base: "inline-flex items-center rounded-md",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      outline: "border-border bg-background",
    },
    size: {
      default: "h-9 px-2.5",
      sm: "h-8 px-2",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
`;

describe("splitCandidates", () => {
  it("keeps arbitrary selectors with spaces intact", () => {
    const parts = splitCandidates(
      "inline-flex [&_svg:not([class*='size-'])]:size-4 gap-1.5",
    );
    expect(parts).toEqual([
      "inline-flex",
      "[&_svg:not([class*='size-'])]:size-4",
      "gap-1.5",
    ]);
  });
});

describe("extractTvConfig", () => {
  it("extracts axes, defaults, and candidates", () => {
    const result = extractTvConfig(sample);
    expect(result.axes.map((a) => a.prop)).toEqual(["variant", "size"]);
    expect(result.axes[0]?.defaultValue).toBe("default");
    expect(result.baseClasses).toContain("inline-flex");
    expect(result.allCandidates).toContain("bg-primary");
    expect(result.classMaps.variant?.outline).toContain("border-border");
  });

  it("rejects dynamic class templates", () => {
    expect(() =>
      extractTvConfig(`const x = 1;\nclass={\`grid-cols-\${x}\`}\n` + sample),
    ).toThrow(GeneratorError);
  });
});

describe("token naming", () => {
  it("is deterministic", () => {
    expect(
      publicTokenName("ui", "button", ["outline", "background", "hover"]),
    ).toBe("--ui-button-outline-background-hover");
  });
});

describe("patch allowlist", () => {
  it("rejects paths outside allowlist", () => {
    const patch = `diff --git a/src/shared/shadcn/button/button.svelte b/src/shared/shadcn/button/button.svelte
--- a/src/shared/shadcn/button/button.svelte
+++ b/src/shared/shadcn/button/button.svelte
diff --git a/secrets.env b/secrets.env
--- a/secrets.env
+++ b/secrets.env
`;
    try {
      validatePatchPaths(patch, ["src/shared/shadcn/"]);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(GeneratorError);
      expect((error as GeneratorError).exitCode).toBe(EXIT.patchApply);
    }
  });
});
