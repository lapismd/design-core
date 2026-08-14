import { describe, expect, it, vi } from "vitest";
import {
  ManagedPluginSettingsRegistry,
  type ManagedPluginSettingsEntry,
} from "./managed-plugin-settings.svelte.js";

describe("ManagedPluginSettingsRegistry", () => {
  it("merges independently owned plugin sources and delegates lifecycle calls", async () => {
    const bundled: ManagedPluginSettingsEntry = {
      id: "markdown",
      name: "Markdown",
      required: false,
      enabled: true,
      status: "enabled",
      distribution: "bundled",
    };
    const roles: ManagedPluginSettingsEntry = {
      id: "roles",
      name: "CV Roles",
      required: false,
      enabled: false,
      status: "disabled",
      distribution: "first-party-external",
    };
    const enable = vi.fn(async () => true);
    const disable = vi.fn(async () => true);
    const registry = new ManagedPluginSettingsRegistry();

    registry.registerSource({
      id: "lapis",
      getEntries: () => [bundled, roles],
      enable,
      disable,
    });

    expect(registry.states).toEqual([
      expect.objectContaining({ key: "lapis:markdown", ...bundled }),
      expect.objectContaining({ key: "lapis:roles", ...roles }),
    ]);
    expect(await registry.enable("lapis:roles")).toBe(true);
    expect(enable).toHaveBeenCalledWith("roles");
    expect(await registry.disable("lapis:markdown")).toBe(true);
    expect(disable).toHaveBeenCalledWith("markdown");
  });

  it("refreshes subscribed state, rejects required disablement, and disposes subscriptions", async () => {
    let listener: () => void = () => undefined;
    let entry: ManagedPluginSettingsEntry = {
      id: "problems",
      name: "Problems",
      required: true,
      enabled: true,
      status: "enabled",
      distribution: "bundled",
    };
    const unsubscribe = vi.fn();
    const disable = vi.fn(async () => true);
    const registry = new ManagedPluginSettingsRegistry();
    const remove = registry.registerSource({
      id: "shell",
      getEntries: () => [entry],
      enable: async () => true,
      disable,
      subscribe(next) {
        listener = next;
        return unsubscribe;
      },
    });

    expect(await registry.disable("shell:problems")).toBe(false);
    expect(disable).not.toHaveBeenCalled();

    entry = { ...entry, status: "failed", error: new Error("load failed") };
    listener();
    expect(registry.states[0]).toMatchObject({
      status: "failed",
      error: expect.any(Error),
    });

    remove();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(registry.states).toEqual([]);
  });

  it("rejects duplicate source identities", () => {
    const registry = new ManagedPluginSettingsRegistry();
    const source = {
      id: "lapis",
      getEntries: () => [],
      enable: async () => true,
      disable: async () => true,
    };
    registry.registerSource(source);
    expect(() => registry.registerSource(source)).toThrow(
      'Duplicate managed plugin source "lapis"',
    );
  });
});
