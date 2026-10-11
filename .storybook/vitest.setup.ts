import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/svelte-vite";
import { beforeAll } from "vitest";
import { installSvelteRuntimeDiagnosticGuard } from "../scripts/storybook-runtime-diagnostics";
import * as projectAnnotations from "./preview";

// Keep diagnostics fatal through story rendering, interactions, and teardown.
installSvelteRuntimeDiagnosticGuard();

// a11y annotations first so preview `parameters.a11y.test` overrides addon defaults.
const project = setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
]);

beforeAll(project.beforeAll);
