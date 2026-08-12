export const CallbackConfig = `<script lang="ts">
  import { StructuredForm } from "@lapismd/design-core/forms";
  import {
    booleanField,
    createFormConfig,
    segmentedField,
    textField,
  } from "@lapismd/design-core/forms/core";

  type Settings = {
    name: string;
    syncMode: string;
    enabled: boolean;
  };

  const config = createFormConfig<Settings>({
    id: "settings",
    fields: [
      textField({
        id: "name",
        label: "Display name",
        get: (value) => value.name,
        set: (value, name) => ({ ...value, name }),
      }),
      segmentedField({
        id: "sync-mode",
        label: "Sync mode",
        options: [
          { value: "automatic", label: "Automatic" },
          { value: "manual", label: "Manual" },
        ],
        get: (value) => value.syncMode,
        set: (value, syncMode) => ({ ...value, syncMode }),
      }),
      booleanField({
        id: "enabled",
        label: "Enabled",
        get: (value) => value.enabled,
        set: (value, enabled) => ({ ...value, enabled }),
      }),
    ],
  });

  let settings = $state<Settings>({
    name: "Northstar",
    syncMode: "automatic",
    enabled: true,
  });
</script>

<StructuredForm
  value={settings}
  {config}
  onChange={(next) => (settings = next)}
/>`;

const currencyKind = `import type { FormFieldKindDefinition } from "@lapismd/design-core/forms/core";

declare module "@lapismd/design-core/forms/core" {
  interface FormFieldKindMap {
    currency: FormFieldKindDefinition<number, { currency: string }>;
  }
}`;

export const MissingCustomRenderer = `<script lang="ts">
  import { StructuredForm } from "@lapismd/design-core/forms";
  import { defineFormConfig } from "@lapismd/design-core/forms/core";

  ${currencyKind}

  type Product = { name: string; price: number };
  const config = defineFormConfig<Product>()({
    id: "product",
    fields: {
      name: { kind: "text", label: "Product" },
      price: { kind: "currency", label: "Price", currency: "GBP" },
    },
  });
  let product = $state<Product>({ name: "Notebook", price: 12 });
</script>

<StructuredForm
  value={product}
  {config}
  onChange={(next) => (product = next)}
/>`;

export const CustomRendererRegistry = `<script lang="ts">
  import {
    StructuredForm,
    createFormRendererRegistry,
  } from "@lapismd/design-core/forms";
  import { defineFormConfig } from "@lapismd/design-core/forms/core";
  import CurrencyInput from "./CurrencyInput.svelte";

  ${currencyKind}

  type Product = { name: string; price: number };
  const registry = createFormRendererRegistry();
  registry.register("currency", { component: CurrencyInput });
  const config = defineFormConfig<Product>()({
    id: "product",
    fields: {
      name: { kind: "text", label: "Product" },
      price: { kind: "currency", label: "Price", currency: "GBP" },
    },
  });
  let product = $state<Product>({ name: "Notebook", price: 12 });
</script>

<StructuredForm
  value={product}
  {config}
  {registry}
  onChange={(next) => (product = next)}
/>`;

export const TypeSafePathConfig = `<script lang="ts">
  import { StructuredForm } from "@lapismd/design-core/forms";
  import { defineFormConfig } from "@lapismd/design-core/forms/core";

  type SocialNetwork = { network: string; username: string };
  type Profile = {
    enabled: boolean;
    name: string;
    socialNetworks: SocialNetwork[];
  };

  const socialNetworkConfig = defineFormConfig<SocialNetwork>()({
    id: "social-network",
    fields: {
      network: { kind: "text" },
      username: { kind: "text" },
    },
  });
  const config = defineFormConfig<Profile>()({
    id: "profile",
    validationMode: "onTouched",
    groups: {
      profile: { title: "Profile", collapsible: true },
    },
    fields: {
      enabled: { kind: "boolean", group: "profile" },
      name: {
        kind: "text",
        group: "profile",
        validate: (value) => value.trim() ? undefined : "Name is required",
      },
      socialNetworks: {
        kind: "array",
        group: "profile",
        presentation: "rows",
        addLabel: "Add",
        createItem: () => ({ network: "LinkedIn", username: "" }),
        itemConfig: socialNetworkConfig,
      },
    },
  });
  let profile = $state<Profile>({
    enabled: true,
    name: "Northstar",
    socialNetworks: [{ network: "GitHub", username: "northstar" }],
  });
</script>

<StructuredForm
  value={profile}
  {config}
  onChange={(next) => (profile = next)}
/>`;
