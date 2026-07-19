import { describe, expect, it } from "vitest";
import { EXIT, GeneratorError } from "../errors.js";
import { validatePatchPaths } from "../adapters/git.js";

describe("generator preflight contracts", () => {
  it("allows only path-allowlisted patch files", () => {
    const patch = `diff --git a/src/shared/shadcn/button/button.svelte b/src/shared/shadcn/button/button.svelte
--- a/src/shared/shadcn/button/button.svelte
+++ b/src/shared/shadcn/button/button.svelte
diff --git a/src/shared/shadcn/button/button.tokens.ts b/src/shared/shadcn/button/button.tokens.ts
--- /dev/null
+++ b/src/shared/shadcn/button/button.tokens.ts
`;
    const paths = validatePatchPaths(patch, [
      "src/shared/shadcn/",
      "tests/visual/storybook.spec.ts-snapshots/",
    ]);
    expect(paths).toContain("src/shared/shadcn/button/button.tokens.ts");
  });

  it("uses distinct exit codes for patch violations", () => {
    try {
      validatePatchPaths(`diff --git a/evil.txt b/evil.txt\n`, [
        "src/shared/shadcn/",
      ]);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(GeneratorError);
      expect((error as GeneratorError).exitCode).toBe(EXIT.patchApply);
    }
  });
});
