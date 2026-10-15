import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { assertBrowserCss } from "./prepare-styles.mjs";

async function checkPrimitiveStates(page) {
  const styles = await page.evaluate(() => {
    const css = (selector) => {
      const element = document.querySelector(selector);
      if (!element)
        throw new Error(`Missing packed consumer element: ${selector}`);
      return getComputedStyle(element);
    };
    const first = css(
      '[data-review="joined"] [data-slot="toggle-group-item"]:first-child',
    );
    return {
      cardInset: css('[data-review="compact"] [data-slot="card-header"]')
        .paddingLeft,
      divider: css('[data-review="compact"] [data-slot="card-header"]')
        .borderBottomWidth,
      label: css('[data-review="disabled"] [data-ui-part="field-label"]')
        .opacity,
      checkbox: css('[data-review="disabled"] [data-slot="checkbox"]').opacity,
      peerLabel: css('[data-review="peer"] [data-slot="label"]').opacity,
      tabDirection: css('[data-review="tabs"] [data-slot="tabs-list"]')
        .flexDirection,
      toggleDirection: css('[data-review="joined"]').flexDirection,
      toggleCorner: first.borderTopLeftRadius,
      toggleMiddleBorder: css(
        '[data-review="joined"] [data-slot="toggle-group-item"]:nth-child(2)',
      ).borderTopWidth,
      addonDivider: css('[data-review="addons"] [data-align="block-start"]')
        .borderBottomWidth,
      alertColumn: css('[data-review="alert"] [data-slot="alert-title"]')
        .gridColumnStart,
      compactTopHeight: css(
        '[data-review="panel-compact-top"] [data-ui-part="indicator"]',
      ).height,
      standardTopHeight: css(
        '[data-review="panel-standard-top"] [data-ui-part="indicator"]',
      ).height,
      compactBottomHeight: css(
        '[data-review="panel-compact-bottom"] [data-ui-part="indicator"]',
      ).height,
      standardBottomHeight: css(
        '[data-review="panel-standard-bottom"] [data-ui-part="indicator"]',
      ).height,
      compactPanelWidth: css('[data-review="panel-compact-left"] svg').width,
      compactPanelHeight: css('[data-review="panel-compact-left"] svg').height,
      standardPanelWidth: css('[data-review="panel-standard-right"] svg').width,
      standardPanelHeight: css('[data-review="panel-standard-right"] svg')
        .height,
      composedIconWidth: css('[data-review="panel-icon-only"]').width,
    };
  });
  assert.equal(styles.cardInset, "16px");
  assert.equal(styles.divider, "1px");
  assert.equal(styles.label, "0.5");
  assert.equal(styles.checkbox, "0.5");
  assert.equal(styles.peerLabel, "0.5");
  assert.equal(styles.tabDirection, "column");
  assert.equal(styles.toggleDirection, "column");
  assert.ok(parseFloat(styles.toggleCorner) > 0);
  assert.equal(styles.toggleMiddleBorder, "0px");
  assert.equal(styles.addonDivider, "1px");
  assert.equal(styles.alertColumn, "2");
  assert.equal(styles.compactTopHeight, "5px");
  assert.equal(styles.standardTopHeight, "5px");
  assert.equal(styles.compactBottomHeight, "5px");
  assert.equal(styles.standardBottomHeight, "5px");
  assert.equal(styles.compactPanelWidth, "18px");
  assert.equal(styles.compactPanelHeight, "12px");
  assert.equal(styles.standardPanelWidth, "16px");
  assert.equal(styles.standardPanelHeight, "16px");
  assert.equal(styles.composedIconWidth, "20px");
  await page.getByRole("tab", { name: "Archive details" }).click();
  assert.equal(
    await page.getByText("Archive details panel", { exact: true }).isVisible(),
    true,
  );
  if (
    (await page
      .getByRole("radio", { name: "Middle option" })
      .getAttribute("aria-checked")) !== "true"
  ) {
    await page.getByRole("radio", { name: "Middle option" }).click();
  }
  assert.equal(
    await page
      .getByRole("radio", { name: "Middle option" })
      .getAttribute("aria-checked"),
    "true",
  );
  await page.getByRole("button", { name: "Packed emoji" }).click();
  const emojiSearch = page.getByRole("searchbox", { name: "Search emoji" });
  await emojiSearch.fill("fire");
  await page.getByRole("button", { name: "🔥", exact: true }).click();
  assert.equal(
    await page.getByTestId("packed-emoji-selection").textContent(),
    "🔥",
  );
  await page
    .getByRole("button", { name: "Choose avatar", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Avatar image URL" })
    .fill("https://example.test/avatar.png");
  assert.equal(
    await page.getByTestId("packed-avatar-value").textContent(),
    "https://example.test/avatar.png",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.getByRole("img", { name: "Packed avatar, online" }).isVisible(),
    true,
  );
  assert.equal(
    await page
      .getByRole("heading", { name: "Packed Markdown", exact: true })
      .isVisible(),
    true,
  );
  assert.equal(
    await page.getByTestId("packed-topbar-center").isVisible(),
    true,
  );
  await page.getByRole("tab", { name: "Files", exact: true }).click();
  assert.equal(
    await page
      .getByRole("tab", { name: "Files", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  const tagList = page.getByRole("list", { name: "Archive tags", exact: true });
  const firstTag = tagList.locator(
    '[data-ui-part="row"] [data-tag-id="first"]',
  );
  await firstTag.waitFor();
  assert.equal(
    await firstTag.evaluate((element) => getComputedStyle(element).height),
    "20px",
  );
  assert.equal(
    await firstTag.evaluate(
      (element) => getComputedStyle(element).borderRadius,
    ),
    "4px",
  );
  const overflow = tagList.getByRole("button", { name: /more archive tags/ });
  await overflow.click();
  const tagPopup = page.getByRole("dialog", {
    name: "Archive tags (3)",
    exact: true,
  });
  await tagPopup.waitFor();
  assert.deepEqual(
    await tagPopup
      .locator('[data-tag-id] [data-ui-part="tag-label"]')
      .allTextContents(),
    [
      "Pinned",
      "A long label preserved in the archive popover",
      "Archive action",
    ],
  );
  assert.equal(
    await tagPopup
      .locator('[data-tag-id="first"]')
      .evaluate((element) => getComputedStyle(element).borderRadius),
    "4px",
  );
  await tagPopup
    .getByRole("button", { name: "Archive action", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="packed-tag-selection"]')
        ?.textContent === "action",
  );
  await tagPopup.waitFor({ state: "hidden" });
  await page.waitForFunction(
    () => document.activeElement?.getAttribute("data-ui-part") === "overflow",
  );
  assert.equal(
    await overflow.evaluate((element) => element === document.activeElement),
    true,
  );
}

async function checkStyles(page) {
  await page.evaluate(() => document.fonts.ready);
  const font = await page.evaluate(() => ({
    family: getComputedStyle(document.body).fontFamily,
    loaded: document.fonts.check('16px "DM Sans Variable"'),
  }));
  assert.match(font.family, /DM Sans Variable/);
  assert.equal(font.loaded, true);
  const update = page.getByRole("button", { name: "Update", exact: true });
  const button = await update.evaluate((element) => {
    const css = getComputedStyle(element);
    return {
      height: css.height,
      padding: css.paddingLeft,
      background: css.backgroundColor,
    };
  });
  assert.equal(button.height, "36px");
  assert.equal(button.padding, "10px");
  assert.notEqual(button.background, "rgba(0, 0, 0, 0)");
  const input = page.getByRole("textbox", {
    name: "Packed input",
    exact: true,
  });
  await input.focus();
  const inputStyle = await input.evaluate((element) => {
    const css = getComputedStyle(element);
    return {
      height: css.height,
      border: css.borderStyle,
      shadow: css.boxShadow,
    };
  });
  assert.equal(inputStyle.height, "36px");
  assert.equal(inputStyle.border, "solid");
  assert.notEqual(inputStyle.shadow, "none");
  await checkPrimitiveStates(page);
  const light = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  const dark = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  assert.notEqual(dark, light);
  await checkPrimitiveStates(page);
  await page.evaluate(() => document.documentElement.classList.remove("dark"));
  const override = page.getByRole("button", {
    name: "Token override",
    exact: true,
  });
  assert.equal(
    await override.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
    "rgb(10, 20, 30)",
  );
  const hidden = page.getByText("Accessible helper", { exact: true });
  assert.equal(
    await hidden.evaluate((element) => getComputedStyle(element).position),
    "absolute",
  );
}

/** Exercise the public archive with a fresh, unconfigured Svelte consumer. */
export async function checkPublicPackageRuntime(tarball, registry) {
  const fixture = mkdtempSync(path.join(tmpdir(), "design-core-cold-public-"));
  let server;
  let browser;
  let serverLog = "";
  try {
    writeFileSync(
      path.join(fixture, "package.json"),
      JSON.stringify({
        name: "design-core-public-runtime",
        private: true,
        type: "module",
        dependencies: { "@lapismd/design-core": "file:" + tarball },
        devDependencies: {
          svelte: "^5.57.1",
          vite: "^7.3.2",
          "@sveltejs/vite-plugin-svelte": "^6.2.1",
          "svelte-check": "^4.6.0",
          typescript: "^5.9.3",
        },
      }),
    );
    writeFileSync(
      path.join(fixture, "index.html"),
      '<div id="app"></div><script type="module" src="/main.ts"></script>',
    );
    writeFileSync(
      path.join(fixture, "main.ts"),
      'import { mount } from "svelte"; import App from "./App.svelte"; import "@lapismd/design-core/styles.css"; mount(App, { target: document.getElementById("app")! });',
    );
    writeFileSync(
      path.join(fixture, "App.svelte"),
      `<script lang="ts">
import { Button } from "@lapismd/design-core/shadcn/button";
import { Input } from "@lapismd/design-core/shadcn/input";
import { CodeEditor } from "@lapismd/design-core/forms";
import * as Card from "@lapismd/design-core/shadcn/card";
import * as Field from "@lapismd/design-core/shadcn/field";
import { Checkbox } from "@lapismd/design-core/shadcn/checkbox";
import { Label } from "@lapismd/design-core/shadcn/label";
import * as Tabs from "@lapismd/design-core/shadcn/tabs";
import * as ToggleGroup from "@lapismd/design-core/shadcn/toggle-group";
import * as InputGroup from "@lapismd/design-core/shadcn/input-group";
import * as Alert from "@lapismd/design-core/shadcn/alert";
import { PanelToggle, PanelToggleIcon, type PanelToggleIconProps } from "@lapismd/design-core/shadcn/panel-toggle";
import { EmojiPicker } from "@lapismd/design-core/shadcn/emoji-picker";
import { ResponsiveTabs } from "@lapismd/design-core/shadcn/responsive-tabs";
import { TagList, type TagListItem, type TagListProps } from "@lapismd/design-core/shadcn/tag-list";
import { Avatar } from "@lapismd/design-core/shadcn/avatar";
import { AvatarPicker } from "@lapismd/design-core/forms";
import { MarkdownContent, Message as SharedMessage } from "@lapismd/design-core/chat";
import { Message as LegacyMessage } from "@lapismd/design-core/ai/chat";
import { AppShell } from "@lapismd/design-core/shell";
if (SharedMessage !== LegacyMessage) throw new Error("Chat compatibility export differs");
let avatarValue = $state("");
let navigationValue = $state("overview");
import { EmojiPicker as LegacyEmojiPicker } from "@lapismd/design-core/ai/experimental";
import HandleLifecycle from "./HandleLifecycle.svelte";
if (EmojiPicker !== LegacyEmojiPicker) throw new Error("Emoji compatibility export differs");
let selectedEmoji = $state("");
let selectedTag = $state("");
const tags: readonly TagListItem[] = [
  { id: "first", label: "Pinned" },
  { id: "long", label: "A long label preserved in the archive popover" },
  { id: "action", label: "Archive action", onClick: (tag) => selectedTag = tag.id },
];
const tagListProps = { tags, label: "Archive tags" } satisfies TagListProps;
let value = $state('const initial = true;');
const panelVariants = ["standard", "compact"] as const;
const panelSides = ["left", "right", "top", "bottom"] as const;
const panelIcon = { side: "bottom", iconVariant: "standard", expanded: true, style: "--ui-panel-toggle-standard-icon-width: 20px" } satisfies PanelToggleIconProps;
</script>
<main><Button onclick={() => value = 'const updated = true;'}>Update</Button>
<Input aria-label="Packed input" />
<Input type="file" aria-label="Recovery bundle" />
<div style="--ui-button-background: rgb(10, 20, 30)"><Button>Token override</Button></div>
<span class="sr-only">Accessible helper</span>
<CodeEditor bind:value ariaLabel="Packed editor" /><HandleLifecycle />
<Card.Root size="sm" data-review="compact"><Card.Header data-divided="true"><Card.Title>Archive card</Card.Title></Card.Header><Card.Content>Compact content</Card.Content><Card.Footer data-divided="true">Footer</Card.Footer></Card.Root>
<Field.Field orientation="horizontal" data-disabled="true" data-review="disabled"><Checkbox id="archive-disabled" disabled /><Field.Label for="archive-disabled">Archive disabled</Field.Label></Field.Field>
<div data-review="peer"><Input id="archive-peer" disabled /><Label for="archive-peer">Disabled input</Label></div>
<Tabs.Root orientation="vertical" value="overview" data-review="tabs"><Tabs.List variant="line"><Tabs.Trigger value="overview">Archive overview</Tabs.Trigger><Tabs.Trigger value="details">Archive details</Tabs.Trigger></Tabs.List><Tabs.Content value="overview">Archive overview panel</Tabs.Content><Tabs.Content value="details">Archive details panel</Tabs.Content></Tabs.Root>
<ToggleGroup.Root type="single" orientation="vertical" variant="outline" spacing={0} data-review="joined"><ToggleGroup.Item value="first">First option</ToggleGroup.Item><ToggleGroup.Item value="middle">Middle option</ToggleGroup.Item><ToggleGroup.Item value="last">Last option</ToggleGroup.Item></ToggleGroup.Root>
<InputGroup.Root data-review="addons"><InputGroup.Addon align="block-start" data-divided="true">Draft</InputGroup.Addon><InputGroup.Textarea aria-label="Archive draft" /><InputGroup.Addon align="block-end" data-divided="true">Private</InputGroup.Addon></InputGroup.Root>
<Alert.Root data-review="alert"><svg aria-hidden="true" width="16" height="16"><circle cx="8" cy="8" r="6" /></svg><Alert.Title>Archive notice</Alert.Title><Alert.Description>Icon alignment.</Alert.Description></Alert.Root>
{#each panelVariants as iconVariant}{#each panelSides as side}<PanelToggle {iconVariant} {side} expanded data-review={['panel', iconVariant, side].join('-')} />{/each}{/each}
<PanelToggleIcon {...panelIcon} class="packed-panel-icon" data-review="panel-icon-only" />
<EmojiPicker triggerLabel="Packed emoji" onSelect={(emoji) => selectedEmoji = emoji} />
<output data-testid="packed-emoji-selection">{selectedEmoji}</output>
<ResponsiveTabs bind:value={navigationValue} items={[{ value: "overview", label: "Overview" }, { value: "files", label: "Files" }]} />
<div style="width:130px;--ui-tag-list-radius:4px"><TagList {...tagListProps} /></div>
<output data-testid="packed-tag-selection">{selectedTag}</output>
<Avatar name="Packed avatar" presence="online" />
<AvatarPicker bind:value={avatarValue} name="Packed profile" />
<output data-testid="packed-avatar-value">{avatarValue}</output>
<AppShell.Topbar>{#snippet center()}<span data-testid="packed-topbar-center">Shared top bar</span>{/snippet}</AppShell.Topbar>
<MarkdownContent content="# Packed Markdown" />
</main>`,
    );
    copyFileSync(
      fileURLToPath(
        new URL(
          "../tests/ai-chat/composer-input-handle-lifecycle.svelte",
          import.meta.url,
        ),
      ),
      path.join(fixture, "HandleLifecycle.svelte"),
    );
    writeFileSync(
      path.join(fixture, "vite.config.mjs"),
      'import { defineConfig } from "vite"; import { svelte } from "@sveltejs/vite-plugin-svelte"; export default defineConfig({ plugins: [svelte()] });',
    );
    writeFileSync(
      path.join(fixture, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          strict: true,
          skipLibCheck: true,
          moduleResolution: "bundler",
          module: "ESNext",
          target: "ES2022",
          noEmit: true,
        },
        include: ["*.ts", "*.svelte"],
      }),
    );
    const install = spawnSync(
      "npm",
      [
        "install",
        "--ignore-scripts",
        // Mira 0.0.x still declares a Tailwind peer through tailwind-variants.
        // Omit auto-installed peers to prove CSS needs no compiler present;
        // this fixture declares its required Svelte/tooling peers explicitly.
        "--omit=peer",
        "--no-audit",
        "--no-fund",
        "--registry",
        registry,
      ],
      { cwd: fixture, encoding: "utf8", timeout: 240_000 },
    );
    assert.equal(install.status, 0, install.stderr || String(install.error));
    for (const dependency of [
      "tailwindcss",
      "@tailwindcss/vite",
      "@tailwindcss/node",
      "tw-animate-css",
      "shadcn-svelte",
    ]) {
      assert.equal(
        existsSync(path.join(fixture, "node_modules", dependency)),
        false,
        `Clean consumer unexpectedly installed ${dependency}`,
      );
    }
    const types = spawnSync(
      process.execPath,
      [
        path.join(fixture, "node_modules/svelte-check/bin/svelte-check"),
        "--tsconfig",
        "./tsconfig.json",
        "--fail-on-warnings",
      ],
      { cwd: fixture, encoding: "utf8", timeout: 120_000 },
    );
    assert.equal(
      types.status,
      0,
      types.stdout + types.stderr || String(types.error),
    );
    console.log("Clean public package consumer type check passed.");
    const reservation = net.createServer();
    await new Promise((resolve, reject) => {
      reservation.once("error", reject);
      reservation.listen(0, "127.0.0.1", resolve);
    });
    const port = reservation.address().port;
    await new Promise((resolve) => reservation.close(resolve));
    server = spawn(
      process.execPath,
      [
        path.join(fixture, "node_modules/vite/bin/vite.js"),
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--strictPort",
      ],
      { cwd: fixture, stdio: ["ignore", "pipe", "pipe"] },
    );
    server.stdout.on("data", (data) => {
      serverLog += data;
    });
    server.stderr.on("data", (data) => {
      serverLog += data;
    });
    const url = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        if ((await fetch(url)).ok) {
          ready = true;
          break;
        }
      } catch {}
      if (server.exitCode !== null) throw new Error(serverLog);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(ready, true, "Cold consumer Vite server did not start");
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => {
      if (/(?:\[svelte\]|svelte\.dev\/e\/[a-z_]+)/u.test(message.text())) {
        errors.push(message.text());
      }
    });
    await page.goto(url);
    const update = page.getByRole("button", { name: "Update", exact: true });
    await update.waitFor();
    await checkStyles(page);
    await page.waitForFunction(() =>
      document.querySelector(".cm-content")?.textContent.includes("initial"),
    );
    await update.click();
    await page.waitForFunction(() =>
      document.querySelector(".cm-content")?.textContent.includes("updated"),
    );
    const ownership = page.getByTestId("handle-ownership");
    assert.equal(await ownership.textContent(), "owned");
    await page.getByRole("button", { name: "Unmount input" }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="handle-ownership"]')
          ?.textContent === "released",
    );
    await page.getByRole("button", { name: "Mount input" }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="handle-ownership"]')
          ?.textContent === "owned",
    );
    await page.getByRole("button", { name: "Replace handle" }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="handle-ownership"]')
          ?.textContent === "replacement",
    );
    await page.getByRole("button", { name: "Unmount input" }).click();
    assert.equal(await ownership.textContent(), "replacement");
    assert.deepEqual(errors, []);
    await page.close();
    await new Promise((resolve) => {
      server.once("exit", resolve);
      server.kill("SIGTERM");
    });
    const build = spawnSync(
      process.execPath,
      [path.join(fixture, "node_modules/vite/bin/vite.js"), "build"],
      { cwd: fixture, encoding: "utf8", timeout: 120_000 },
    );
    assert.equal(
      build.status,
      0,
      build.stdout + build.stderr || String(build.error),
    );
    for (const file of readdirSync(path.join(fixture, "dist"), {
      recursive: true,
    })) {
      if (file.endsWith(".css"))
        assertBrowserCss(
          readFileSync(path.join(fixture, "dist", file), "utf8"),
          file,
        );
    }
    server = spawn(
      process.execPath,
      [
        path.join(fixture, "node_modules/vite/bin/vite.js"),
        "preview",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--strictPort",
      ],
      { cwd: fixture, stdio: ["ignore", "pipe", "pipe"] },
    );
    server.stdout.on("data", (data) => {
      serverLog += data;
    });
    server.stderr.on("data", (data) => {
      serverLog += data;
    });
    ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        if ((await fetch(url)).ok) {
          ready = true;
          break;
        }
      } catch {}
      if (server.exitCode !== null) throw new Error(serverLog);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(ready, true, "Production consumer preview did not start");
    const production = await browser.newPage();
    production.on("pageerror", (error) => errors.push(String(error)));
    await production.goto(url);
    await production
      .getByRole("button", { name: "Update", exact: true })
      .waitFor();
    await checkStyles(production);
    assert.deepEqual(errors, []);
    console.log(
      "Cold development and production CSS, fonts, focus, themes, token overrides, TagList overflow/actions, reactive CodeEditor, and bound Composer Input lifecycle passed without Tailwind tooling or Svelte diagnostics.",
    );
  } catch (error) {
    console.error(serverLog.slice(-10000));
    throw error;
  } finally {
    await browser?.close();
    if (server && server.exitCode === null) {
      await new Promise((resolve) => {
        server.once("exit", resolve);
        server.kill("SIGTERM");
      });
    }
    rmSync(fixture, { recursive: true, force: true });
  }
}
