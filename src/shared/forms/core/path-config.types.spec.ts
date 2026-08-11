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
  optionalNested?: { title?: string | null };
  price: number;
};

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "toggle"; enabled: boolean };
type VariantValues = { blocks: ContentBlock[] };

declare module "@lapismd/design-core/forms/core" {
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
      | "optionalNested"
      | "optionalNested.title"
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
    expectTypeOf<
      FieldPathValue<ExampleValues, "optionalNested.title">
    >().toEqualTypeOf<string | null | undefined>();
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

    defineFormConfig<ExampleValues>()({
      id: "invalid-custom-options",
      fields: {
        price: {
          // @ts-expect-error custom renderer options retain their exact type
          kind: "currency",
          // @ts-expect-error custom renderer options retain their exact type
          currency: 10,
        },
      },
    });
  });

  it("correlates discriminated variants with exact factories and configs", () => {
    const textConfig = defineFormConfig<
      Extract<ContentBlock, { type: "text" }>
    >()({
      id: "text-block",
      fields: { text: { kind: "text" } },
    });
    const toggleConfig = defineFormConfig<
      Extract<ContentBlock, { type: "toggle" }>
    >()({
      id: "toggle-block",
      fields: { enabled: { kind: "boolean" } },
    });

    const config = defineFormConfig<VariantValues>()({
      id: "variants",
      fields: {
        blocks: {
          kind: "variant-array",
          discriminator: "type",
          variants: {
            text: {
              label: "Text",
              createItem: () => ({ type: "text", text: "" }),
              itemConfig: textConfig,
            },
            toggle: {
              label: "Toggle",
              createItem: () => ({ type: "toggle", enabled: false }),
              itemConfig: toggleConfig,
            },
          },
        },
      },
    });

    expect(config.fields.blocks.discriminator).toBe("type");

    defineFormConfig<VariantValues>()({
      id: "bad-variants",
      fields: {
        blocks: {
          kind: "variant-array",
          discriminator: "type",
          // @ts-expect-error every discriminator value needs an exact variant
          variants: {
            text: {
              label: "Text",
              createItem: () => ({ type: "text", text: "" }),
              itemConfig: textConfig,
            },
          },
        },
      },
    });
  });
});
