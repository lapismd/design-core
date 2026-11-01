import { expect, it } from "vitest";
import { WorkspaceSettingsController } from "./settings-controller.svelte.js";

function fixture(unreadable = false) {
  let value = true;
  let failed = false;
  const listeners = new Set<() => void>();
  const controller = new WorkspaceSettingsController();
  controller.registerDefinition({
    section: {
      id: "service",
      title: "Service",
      fields: [
        { id: "enabled", type: "boolean", title: "Enabled", default: true },
      ],
    },
    source: {
      get() {
        if (failed && unreadable) throw new Error("Source cannot be read");
        return value;
      },
      async set(_id, next) {
        value = next === true;
        for (const listener of listeners) listener();
        failed = true;
        throw new Error("Acknowledgement lost");
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
  });
  return controller;
}

it("keeps the authoritative saved value when an acknowledgement is lost", async () => {
  const controller = fixture();
  await expect(controller.set("enabled", false)).resolves.toBe(false);
  expect(controller.get("enabled")).toBe(false);
  expect(controller.getError("enabled")).toBe("Acknowledgement lost");
  expect(controller.isBusy("enabled")).toBe(false);
});

it("retains the previous value and original write error if reconciliation cannot read", async () => {
  const controller = fixture(true);
  await expect(controller.set("enabled", false)).resolves.toBe(false);
  expect(controller.get("enabled")).toBe(true);
  expect(controller.getError("enabled")).toBe("Acknowledgement lost");
  expect(controller.isBusy("enabled")).toBe(false);
});
