import { describe, expect, expectTypeOf, it } from "vitest";
import { defineFormConfig } from "./path-config";
import type { FormFieldKindDefinition } from "./path-config";
import type {
  FieldArrayPath,
  FieldPath,
  FieldPathByValue,
  FieldPathValue,
} from "./path-types";

type SocialNetwork = {
  network: string;
  username: string;
};

type ExampleValues = {
  enabled: boolean;
  name: string;
  optionalHeadline?: string | null;
  targetRoles: string[];
  socialNetworks: SocialNetwork[];
  nested: { count: number };
  price: number;
};

declare module "./path-config" {
  interface FormFieldKindMap {
    currency: FormFieldKindDefinition<number, { currency: string }>;
  }
}

describe("config-driven form types", () => {
  it("resolves nested and array path values", () => {
    expectTypeOf<FieldPath<ExampleValues>>().toEqualTypeOf<
      | "enabled"
      | "name"
      | "optionalHeadline"
      | "targetRoles"
      | `targetRoles.${number}`
      | "socialNetworks"
      | `socialNetworks.${number}`
      | `socialNetworks.${number}.network`
      | `socialNetworks.${number}.username`
      | "nested"
      | "nested.count"
      | "price"
    >();
    expectTypeOf<FieldArrayPath<ExampleValues>>().toEqualTypeOf<
      "targetRoles" | "socialNetworks"
    >();
    expectTypeOf<
      FieldPathValue<ExampleValues, `socialNetworks.${number}.username`>
    >().toEqualTypeOf<string>();
    expectTypeOf<
      FieldPathByValue<ExampleValues, boolean>
    >().toEqualTypeOf<"enabled">();
  });

  it("accepts value-compatible leaf and array definitions", () => {
    const config = defineFormConfig<ExampleValues>()({
      id: "example",
      groups: { profile: { title: "Profile", collapsible: true } },
      fields: {
        enabled: { kind: "boolean", group: "profile" },
        name: { kind: "text", group: "profile", defaultValue: "Unknown" },
        optionalHeadline: { kind: "textarea", group: "profile" },
        targetRoles: {
          kind: "array",
          group: "profile",
          createItem: () => "",
          itemField: { kind: "text" },
        },
        socialNetworks: {
          kind: "array",
          group: "profile",
          createItem: () => ({ network: "LinkedIn", username: "" }),
          itemConfig: defineFormConfig<SocialNetwork>()({
            id: "social-network",
            fields: {
              network: { kind: "options" },
              username: { kind: "text" },
            },
          }),
        },
        price: { kind: "currency", currency: "GBP" },
      },
    });

    expect(config.id).toBe("example");
    expectTypeOf(config.fields.enabled?.defaultValue).toEqualTypeOf<
      boolean | undefined
    >();
  });

  it("rejects incompatible paths, kinds, defaults, and item factories", () => {
    defineFormConfig<ExampleValues>()({
      id: "invalid-path",
      fields: {
        // @ts-expect-error unknown is not a field path
        unknown: { kind: "text" },
      },
    });

    defineFormConfig<ExampleValues>()({
      id: "invalid-kind",
      fields: {
        // @ts-expect-error a boolean path cannot use a text renderer
        enabled: { kind: "text" },
      },
    });

    defineFormConfig<ExampleValues>()({
      id: "invalid-default",
      fields: {
        // @ts-expect-error defaults must match the path value
        name: { kind: "text", defaultValue: false },
      },
    });

    defineFormConfig<ExampleValues>()({
      id: "invalid-factory",
      fields: {
        socialNetworks: {
          kind: "array",
          // @ts-expect-error array factories return the exact item type
          createItem: () => ({ network: "LinkedIn" }),
          itemConfig: defineFormConfig<SocialNetwork>()({
            id: "social-network",
            fields: {},
          }),
        },
      },
    });
  });
});
