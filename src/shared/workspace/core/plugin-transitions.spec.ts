import { expect, it, vi } from "vitest";
import { AppShellController } from "./app-shell-controller.svelte.js";
import { AppShellPlugin } from "./plugin-manager.svelte.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it("flushes an admitted plugin transition through its pending persistence", async () => {
  const loading = deferred(),
    saving = deferred();
  class Example extends AppShellPlugin {
    async onload() {
      await loading.promise;
    }
  }
  const save = vi.fn(() => saving.promise);
  const controller = new AppShellController({
    plugins: [{ id: "example", plugin: Example, enabled: false }],
    persistence: { plugins: { load: async () => null, save } },
  });
  await controller.plugins.start();
  let flushed = false;
  const enabling = controller.plugins.enable("example");
  try {
    const flush = controller.plugins.flushChanges().then(() => {
      flushed = true;
    });
    await Promise.resolve();
    expect(flushed).toBe(false);
    loading.resolve();
    await vi.waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(flushed).toBe(false);
    saving.resolve();
    await Promise.all([enabling, flush]);
    expect(flushed).toBe(true);
  } finally {
    loading.resolve();
    saving.resolve();
    await enabling;
    await controller.plugins.stop();
  }
});

it("waits for an admitted disable before stop and unloads each instance once", async () => {
  const unloading = deferred();
  const unload = vi.fn(() => unloading.promise);
  class Example extends AppShellPlugin {
    async onunload() {
      await unload();
    }
  }
  const controller = new AppShellController({
    plugins: [{ id: "example", plugin: Example }],
  });
  await controller.plugins.start();
  const disabling = controller.plugins.disable("example");
  const stopping = controller.plugins.stop();
  await Promise.resolve();
  try {
    expect(unload).toHaveBeenCalledOnce();
  } finally {
    unloading.resolve();
    await Promise.all([disabling, stopping]);
  }
});
