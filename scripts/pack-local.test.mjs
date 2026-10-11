import test from "node:test";
import assert from "node:assert/strict";
import { preparedExports } from "./pack-local.mjs";

test("prepared package retains all public names and points runtime entries at built files", () => {
  const input = {
    "./shell": "./src/shared/shell/index.ts",
    "./shadcn/*": "./src/shared/shadcn/*/index.ts",
    "./forms/FormField.svelte":
      "./src/shared/forms/form-field/FormField.svelte",
    "./styles.css": "./src/styles.css",
    "./nested": { import: "./src/index.ts", types: "./src/index.d.ts" },
  };
  assert.deepEqual(preparedExports(input), {
    "./shell": {
      types: "./dist/shared/shell/index.d.ts",
      svelte: "./dist/shared/shell/index.js",
      import: "./dist/shared/shell/index.js",
    },
    "./shadcn/*": {
      types: "./dist/shared/shadcn/*/index.d.ts",
      svelte: "./dist/shared/shadcn/*/index.js",
      import: "./dist/shared/shadcn/*/index.js",
    },
    "./forms/FormField.svelte": {
      types: "./dist/shared/forms/form-field/FormField.svelte.d.ts",
      svelte: "./dist/shared/forms/form-field/FormField.svelte",
      import: "./dist/shared/forms/form-field/FormField.svelte",
    },
    "./styles.css": "./dist/styles.css",
    "./nested": { import: "./dist/index.js", types: "./dist/index.d.ts" },
  });
  assert.equal(input["./shell"], "./src/shared/shell/index.ts");
});
