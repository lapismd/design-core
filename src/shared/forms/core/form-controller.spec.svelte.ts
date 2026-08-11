import { describe, expect, it, vi } from "vitest";
import { createFormController } from "./form-controller.svelte";
import { defineFormConfig } from "./path-config";

type Values = {
  name: string;
  confirmation: string;
  items: Array<{ name: string }>;
};

function createHarness(
  mode: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all",
) {
  const validate = vi.fn((value: string) =>
    value.trim() ? undefined : "Name is required",
  );
  const config = defineFormConfig<Values>()({
    id: `form-${mode}`,
    validationMode: mode,
    fields: {
      name: { kind: "text", validate },
      confirmation: {
        kind: "text",
        dependsOn: ["name"],
        validate: (value, { root }) =>
          value === root.name ? undefined : "Values must match",
      },
    },
  });
  let value: Values = { name: "Initial", confirmation: "Initial", items: [] };
  const onChange = vi.fn((next: Values) => {
    value = next;
  });
  const controller = createFormController<Values>({ defaultValues: value });
  controller.connect({ value, config, context: undefined, onChange });
  return { controller, onChange, validate, value: () => value };
}

describe("FormController", () => {
  it.each([
    ["onSubmit", 0, 0],
    ["onBlur", 0, 1],
    ["onChange", 1, 1],
    ["onTouched", 0, 1],
    ["all", 1, 2],
  ] as const)(
    "applies the %s validation lifecycle",
    async (mode, afterChange, afterBlur) => {
      const { controller, validate } = createHarness(mode);
      controller.notifyChange("name", {
        name: "",
        confirmation: "Initial",
        items: [],
      });
      await Promise.resolve();
      expect(validate).toHaveBeenCalledTimes(afterChange);

      controller.notifyBlur("name");
      await Promise.resolve();
      expect(validate).toHaveBeenCalledTimes(afterBlur);

      if (mode === "onTouched") {
        controller.notifyChange("name", {
          name: "Still invalid",
          confirmation: "Initial",
          items: [],
        });
        await Promise.resolve();
        expect(validate).toHaveBeenCalledTimes(2);
      }
      if (mode === "onSubmit") {
        await controller.validate();
        expect(validate).toHaveBeenCalledTimes(1);
      }
    },
  );

  it("tracks dirty and touched state and resets through the controlled boundary", () => {
    const { controller, onChange } = createHarness("onSubmit");
    controller.notifyChange("name", {
      name: "Changed",
      confirmation: "Initial",
      items: [],
    });
    controller.notifyBlur("name");

    expect(controller.isDirty).toBe(true);
    expect(controller.getFieldState("name")).toMatchObject({
      isDirty: true,
      isTouched: true,
    });

    controller.reset();
    expect(onChange).toHaveBeenLastCalledWith({
      name: "Initial",
      confirmation: "Initial",
      items: [],
    });
    expect(controller.isDirty).toBe(false);
    expect(controller.touchedFields.size).toBe(0);
  });

  it("moves and removes array metadata with stable item identities", () => {
    const config = defineFormConfig<Values>()({ id: "items", fields: {} });
    const value: Values = {
      name: "Initial",
      confirmation: "Initial",
      items: [{ name: "one" }, { name: "two" }],
    };
    const controller = createFormController<Values>({ defaultValues: value });
    controller.connect({
      value,
      config,
      context: undefined,
      onChange: vi.fn(),
    });
    const ids = controller.itemIds("items", value.items);
    controller.dirtyFields.add("items.0.name");
    controller.touchedFields.add("items.1.name");

    controller.moveItemIdentity("items", 0, 1);
    expect(controller.itemIds("items", value.items)).toEqual([ids[1], ids[0]]);
    expect(controller.dirtyFields.has("items.1.name")).toBe(true);
    expect(controller.touchedFields.has("items.0.name")).toBe(true);

    controller.removeItemIdentity("items", 0);
    expect(controller.dirtyFields.has("items.0.name")).toBe(true);
    expect(controller.touchedFields.size).toBe(0);
  });

  it("discards stale async validation results", async () => {
    const resolvers: Array<(value: string | undefined) => void> = [];
    const config = defineFormConfig<Values>()({
      id: "async",
      fields: {
        name: {
          kind: "text",
          validate: () =>
            new Promise<string | undefined>((resolve) =>
              resolvers.push(resolve),
            ),
        },
      },
    });
    const initial: Values = {
      name: "initial",
      confirmation: "",
      items: [],
    };
    const controller = createFormController<Values>({ defaultValues: initial });
    controller.connect({
      value: initial,
      config,
      context: undefined,
      onChange: vi.fn(),
    });

    const first = controller.validate("name");
    const second = controller.validate("name");
    resolvers[1](undefined);
    await second;
    resolvers[0]("Stale error");
    await first;

    expect(controller.getFieldState("name").issues).toEqual([]);
  });
});
