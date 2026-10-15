import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  assertBrowserCss,
  assertNoUtilitySelectors,
  prepareStyles,
} from "./prepare-styles.mjs";

const root = path.resolve(import.meta.dirname, "..");

function fixture(t) {
  mkdirSync(path.join(root, ".local"), { recursive: true });
  const directory = mkdtempSync(path.join(root, ".local", "style-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test("prepares browser CSS with static defaults, keyframes and portable licensed fonts", async (t) => {
  const directory = fixture(t);
  writeFileSync(
    path.join(directory, "styles.css"),
    `
@import "tailwindcss";
@import "@fontsource-variable/dm-sans";
@import "tw-animate-css";
@theme inline { --font-sans: "DM Sans Variable", sans-serif; }
body { @apply font-sans; }
`,
  );
  writeFileSync(
    path.join(directory, "storybook.css"),
    `
@import "./styles.css";
#storybook-root { @apply min-h-full; }
`,
  );
  writeFileSync(
    path.join(directory, "component.svelte"),
    // Use an existing catalog token: authoring Tailwind also scans tooling
    // fixtures. Static package compilation must retain enter/exit below even
    // though this fixture never references those animations.
    `<button data-ui-component="fixture">OK</button>
<style>[data-ui-component="fixture"] { padding: var(--spacing); animation: var(--animate-pulse); }</style>`,
  );
  const result = await prepareStyles(directory);
  assert.deepEqual(result, { compiled: 2, audited: 3, remainingUtilities: [] });
  const css = readFileSync(path.join(directory, "styles.css"), "utf8");
  assertBrowserCss(css);
  assert.match(css, /--spacing: 0\.25rem/);
  assert.match(css, /--font-sans: "DM Sans Variable"/);
  assert.match(css, /--default-transition-duration:/);
  assert.match(css, /@keyframes enter/);
  assert.match(css, /@keyframes exit/);
  assert.match(css, /@keyframes pulse/);
  assert.doesNotMatch(css, /\.flex\s*\{|\.font-sans\s*\{/);
  assert.match(
    css,
    /url\(assets\/[a-f0-9]+-dm-sans-latin-wght-normal\.woff2\)/,
  );
  assert.doesNotMatch(css, /node_modules|\.pnpm|\/Users\/|\/tmp\//);
  const assets = readdirSync(path.join(directory, "assets"));
  assert.equal(assets.filter((file) => file.endsWith(".woff2")).length, 2);
  assert.ok(assets.some((file) => file.includes("LICENSE")));
  assert.match(
    readFileSync(path.join(directory, "storybook.css"), "utf8"),
    /min-height: 100%/,
  );
  await prepareStyles(directory);
  assert.equal(readFileSync(path.join(directory, "styles.css"), "utf8"), css);
});

test("rejects compiler syntax and generated utility selectors, including variants", () => {
  for (const css of [
    '@import "tailwindcss";',
    "@theme { --spacing: 1rem; }",
    "body { @apply font-sans; }",
    ".ui-control { width: --spacing(4); }",
  ])
    assert.throws(() => assertBrowserCss(css), /Tailwind|Prepared CSS/);
  for (const css of [
    ".flex { display:flex; }",
    ".hover\\:p-4:hover { padding:1rem; }",
    ".group\\/field { display:block; }",
  ]) {
    assert.throws(
      () => assertNoUtilitySelectors(css),
      /Tailwind utility selector/,
    );
  }
  assert.doesNotThrow(() =>
    assertBrowserCss(`
/* Tailwind license and @theme documentation are not executable syntax. */
@property --tw-shadow { syntax: "*"; inherits: false; initial-value: none; }
.ui-control { box-shadow: var(--tw-shadow); }
.sr-only { position: absolute; }
.dark .cn-marker { color: var(--foreground); }
`),
  );
});

test("prepares a standalone theme without a utility generation root", async (t) => {
  const directory = fixture(t);
  const file = path.join(directory, "theme.css");
  writeFileSync(file, '@theme inline { --font-sans: "DM Sans Variable"; }');
  await prepareStyles(directory);
  const css = readFileSync(file, "utf8");
  assertBrowserCss(css);
  assert.match(css, /--font-sans: "DM Sans Variable"/);
});

test("fails packaging when a component embeds an unconverted utility selector", async (t) => {
  const directory = fixture(t);
  writeFileSync(
    path.join(directory, "component.svelte"),
    "<div></div><style>.grid { display: grid; }</style>",
  );
  await assert.rejects(
    prepareStyles(directory),
    /Tailwind utility selector .grid/,
  );
  const local = await prepareStyles(directory, {
    requireNoUtilitySelectors: false,
  });
  assert.deepEqual(
    local.remainingUtilities.map(({ file, token }) => ({ file, token })),
    [{ file: "component.svelte", token: "grid" }],
  );
});

test("rejects explicit source scanning and missing font assets", async (t) => {
  const directory = fixture(t);
  const stylesheet = path.join(directory, "styles.css");
  writeFileSync(stylesheet, '@import "tailwindcss"; @source "./consumer";');
  await assert.rejects(prepareStyles(directory), /must not scan source files/);
  writeFileSync(
    stylesheet,
    '@import "tailwindcss"; @font-face { font-family: Missing; src: url(./missing.woff2); }',
  );
  await assert.rejects(prepareStyles(directory), /Missing CSS asset/);
});

test("existing authoring stylesheet is rejected before package preparation", () => {
  assert.throws(
    () =>
      assertBrowserCss(readFileSync(path.join(root, "src/styles.css"), "utf8")),
    /Prepared CSS|Tailwind/,
  );
});
