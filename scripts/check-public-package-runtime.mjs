import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

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
import { CodeEditor } from "@lapismd/design-core/forms";
import HandleLifecycle from "./HandleLifecycle.svelte";
let value = $state('const initial = true;');
</script>
<main><Button onclick={() => value = 'const updated = true;'}>Update</Button><CodeEditor bind:value ariaLabel="Packed editor" /><HandleLifecycle /></main>`,
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
        "--no-audit",
        "--no-fund",
        "--registry",
        registry,
      ],
      { cwd: fixture, encoding: "utf8", timeout: 240_000 },
    );
    assert.equal(install.status, 0, install.stderr || String(install.error));
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
    console.log(
      "Cold public tarball startup, reactive CodeEditor update, and bound Composer Input handle lifecycle passed with zero Svelte diagnostics.",
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
