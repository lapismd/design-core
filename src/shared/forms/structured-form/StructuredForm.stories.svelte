<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import * as exampleSources from "./StructuredForm.example-sources.js";
  import StructuredForm from "./StructuredForm.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Orchestrators/Structured Form",
    component: StructuredForm,
    parameters: {
      docs: {
        description: {
          component:
            "Config-driven form runtime for schema-shaped data. See UI Forms/Guidance.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import {
    booleanField,
    createFormConfig,
    segmentedField,
    textField,
    defineFormConfig,
  } from "../core/core";
  import CurrencyFormControl from "./CurrencyFormControl.story.svelte";
  import { createFormRendererRegistry } from "./form-renderer-registry";
  import "./StructuredForm.currency-kind.story";

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
        get: (s) => s.name,
        set: (s, name) => ({ ...s, name }),
      }),
      segmentedField({
        id: "sync-mode",
        label: "Sync mode",
        options: [
          { value: "automatic", label: "Automatic" },
          { value: "manual", label: "Manual" },
        ],
        get: (s) => s.syncMode,
        set: (s, syncMode) => ({ ...s, syncMode }),
      }),
      booleanField({
        id: "enabled",
        label: "Enabled",
        get: (s) => s.enabled,
        set: (s, enabled) => ({ ...s, enabled }),
      }),
    ],
  });

  let settings = $state<Settings>({
    name: "Northstar",
    syncMode: "automatic",
    enabled: true,
  });

  type Profile = {
    enabled: boolean;
    name: string;
    socialNetworks: Array<{ network: string; username: string }>;
  };

  const socialNetworkConfig = defineFormConfig<
    Profile["socialNetworks"][number]
  >()({
    id: "typed-social-network",
    fields: {
      network: { kind: "text" },
      username: { kind: "text" },
    },
  });

  const typedConfig = defineFormConfig<Profile>()({
    id: "typed-profile",
    validationMode: "onTouched",
    groups: {
      profile: { title: "Profile", collapsible: true },
    },
    fields: {
      enabled: { kind: "boolean", group: "profile" },
      name: {
        kind: "text",
        group: "profile",
        label: "Name",
        validate: (value) => (value.trim() ? undefined : "Name is required"),
      },
      socialNetworks: {
        kind: "array",
        group: "profile",
        label: "Social Networks",
        presentation: "rows",
        addPlacement: "header",
        addLabel: "Add",
        createItem: () => ({ network: "LinkedIn", username: "" }),
        itemTitle: ({ item }) => item.network || "Social network",
        itemConfig: socialNetworkConfig,
        testId: "typed-social-networks",
      },
    },
  });

  let profile = $state<Profile>({
    enabled: true,
    name: "Northstar",
    socialNetworks: [{ network: "GitHub", username: "northstar" }],
  });

  type Product = { name: string; price: number };
  const currencyRegistry = createFormRendererRegistry();
  currencyRegistry.register("currency", {
    component: CurrencyFormControl,
  });
  const productConfig = defineFormConfig<Product>()({
    id: "typed-product",
    fields: {
      name: { kind: "text", label: "Product" },
      price: {
        kind: "currency",
        label: "Price",
        currency: "GBP",
      },
    },
  });
  let product = $state<Product>({ name: "Notebook", price: 12 });

  type WrappingTextFields = {
    text: string;
    email: string;
    search: string;
    telephone: string;
    url: string;
  };

  const longText =
    "A deliberately long value that must wrap when the form becomes narrow";
  const wrappingTextConfig = createFormConfig<WrappingTextFields>({
    id: "wrapping-text-fields",
    fields: [
      textField({
        id: "text",
        label: "Text",
        get: (value) => value.text,
        set: (value, text) => ({ ...value, text }),
      }),
      textField({
        id: "email",
        label: "Email",
        inputType: "email",
        get: (value) => value.email,
        set: (value, email) => ({ ...value, email }),
      }),
      textField({
        id: "search",
        label: "Search",
        inputType: "search",
        get: (value) => value.search,
        set: (value, search) => ({ ...value, search }),
      }),
      textField({
        id: "telephone",
        label: "Telephone",
        inputType: "tel",
        get: (value) => value.telephone,
        set: (value, telephone) => ({ ...value, telephone }),
      }),
      textField({
        id: "url",
        label: "URL",
        inputType: "url",
        get: (value) => value.url,
        set: (value, url) => ({ ...value, url }),
      }),
    ],
  });

  let wrappingTextFields = $state<WrappingTextFields>({
    text: longText,
    email: "a-long-email-address-for-wrapping@example.test",
    search: longText,
    telephone: "+44 20 7946 0958 extension 123456789",
    url: "https://example.test/a/deliberately/long/path/that/must/wrap",
  });
</script>

<Story
  name="Updates a schema-shaped form"
  parameters={{
    docs: {
      source: {
        code: exampleSources.CallbackConfig,
        language: "tsx",
        type: "code",
      },
    },
  }}
  play={async ({ canvas }) => {
    const name = canvas.getByLabelText("Display name");
    await userEvent.clear(name);
    await userEvent.type(name, "Studio");
    await userEvent.click(canvas.getByRole("button", { name: "Manual" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Studio uses manual",
    );
  }}
  tags={["visual-failed"]}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <StructuredForm
        value={settings}
        {config}
        onChange={(next) => {
          settings = next as Settings;
        }}
      />
      <output class="text-muted-foreground mt-3 block text-sm">
        {settings.name} uses {settings.syncMode} sync
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Reports an unregistered custom renderer"
  exportName="MissingCustomRenderer"
  parameters={{
    docs: {
      source: {
        code: exampleSources.MissingCustomRenderer,
        language: "tsx",
        type: "code",
      },
    },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "No renderer is registered for field kind “currency”",
    );
  }}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <StructuredForm
        value={product}
        config={productConfig}
        onChange={(next) => {
          product = next;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Uses an explicit custom renderer registry"
  exportName="CustomRendererRegistry"
  parameters={{
    docs: {
      source: {
        code: exampleSources.CustomRendererRegistry,
        language: "tsx",
        type: "code",
      },
    },
  }}
  play={async ({ canvas }) => {
    const price = canvas.getByLabelText("Price");
    await userEvent.clear(price);
    await userEvent.type(price, "18");
    await expect(price).toHaveValue(18);
    await expect(canvas.getByRole("status")).toHaveTextContent("GBP 18");
  }}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <StructuredForm
        value={product}
        config={productConfig}
        registry={currencyRegistry}
        onChange={(next) => {
          product = next;
        }}
      />
      <output class="text-muted-foreground mt-3 block text-sm">
        {product.name}: GBP {product.price}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Renders a type-safe path config"
  exportName="TypeSafePathConfig"
  parameters={{
    docs: {
      source: {
        code: exampleSources.TypeSafePathConfig,
        language: "tsx",
        type: "code",
      },
    },
  }}
  play={async ({ canvas }) => {
    const name = canvas.getByLabelText("Name");
    await userEvent.clear(name);
    await userEvent.type(name, "Studio");
    await expect(name).toHaveValue("Studio");

    const networks = canvas.getByTestId("typed-social-networks");
    await userEvent.click(
      within(networks).getByRole("button", { name: "Add" }),
    );
    await expect(within(networks).getAllByLabelText("Network")).toHaveLength(2);
    await userEvent.click(
      within(networks).getAllByRole("button", { name: "Move up" })[1],
    );
    await userEvent.click(
      within(networks).getAllByRole("button", {
        name: "Remove LinkedIn",
      })[0],
    );
    await expect(within(networks).getAllByLabelText("Network")).toHaveLength(1);
  }}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <StructuredForm
        value={profile}
        config={typedConfig}
        onChange={(next) => {
          profile = next;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Wraps text-like inputs"
  exportName="WrappingTextInputs"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: {
        story:
          "Text-like controls wrap and autosize when their form container becomes narrower.",
      },
    },
  }}
  play={async ({ canvas }) => {
    const host = canvas.getByTestId("wrapping-text-fields");
    const controls = ["Text", "Email", "Search", "Telephone", "URL"].map(
      (label) => canvas.getByLabelText(label) as HTMLTextAreaElement,
    );

    await waitFor(() => {
      for (const control of controls) {
        expect(control.tagName).toBe("TEXTAREA");
        expect(getComputedStyle(control).overflow).not.toBe("hidden");
        expect(getComputedStyle(control).whiteSpace).toBe("pre-wrap");
        expect(control.scrollWidth).toBeLessThanOrEqual(
          control.clientWidth + 1,
        );
        expect(control.scrollHeight).toBeLessThanOrEqual(
          control.clientHeight + 1,
        );
      }
    });

    const initialHeights = controls.map((control) => control.clientHeight);
    host.style.width = "12rem";

    await waitFor(() => {
      expect(
        controls.some(
          (control, index) => control.clientHeight > initialHeights[index],
        ),
      ).toBe(true);
      for (const control of controls) {
        expect(control.scrollWidth).toBeLessThanOrEqual(
          control.clientWidth + 1,
        );
        expect(control.scrollHeight).toBeLessThanOrEqual(
          control.clientHeight + 1,
        );
      }
    });
  }}
>
  {#snippet template()}
    <div data-testid="wrapping-text-fields" style="width: 18rem">
      <StructuredForm
        value={wrappingTextFields}
        config={wrappingTextConfig}
        onChange={(next) => {
          wrappingTextFields = next;
        }}
      />
    </div>
  {/snippet}
</Story>
