import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/svelte-vite";
import { afterAll, afterEach, beforeAll } from "vitest";
import { installSvelteRuntimeDiagnosticGuard } from "../scripts/storybook-runtime-diagnostics";
import * as projectAnnotations from "./preview";

// Keep diagnostics fatal through story rendering, interactions, and teardown.
const runtimeDiagnostics: string[] = [];
installSvelteRuntimeDiagnosticGuard((message) => {
  runtimeDiagnostics.push(message);
});
function assertNoRuntimeDiagnostics(): void {
  if (runtimeDiagnostics.length === 0) return;
  const diagnostics = runtimeDiagnostics.splice(0);
  throw new Error(`Svelte runtime diagnostics:\n${diagnostics.join("\n")}`);
}
// Teardown may catch an immediately thrown console error. Its diagnostic
// remains fatal after the story and after final suite cleanup.
afterEach(assertNoRuntimeDiagnostics);
afterAll(assertNoRuntimeDiagnostics);

// a11y annotations first so preview `parameters.a11y.test` overrides addon defaults.
const project = setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
]);

beforeAll(project.beforeAll);
