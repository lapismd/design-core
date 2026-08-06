/**
 * Catalog visual suite — packaged Visual Delta capture (nested-import).
 * Same path as `visual-delta update` / panel Create visual.
 */
import { defineVisualSuite } from "@lapismd/storybook-addon-visual-delta/playwright";

defineVisualSuite({
  baselinePathMode: "nested-import",
  includeStory: (entry) =>
    !(entry.tags ?? []).includes("visual-delta-self-test"),
});
