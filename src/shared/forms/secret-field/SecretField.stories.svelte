<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import FormField from "../form-field/FormField.svelte";
  import SecretField from "./SecretField.svelte";
  import { secretFieldMode } from "./secret-field-value";

  const environmentKeys = ["BANK_API_TOKEN", "LUNCHFLOW_API_KEY"];

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Secret Field",
    component: SecretField,
    parameters: {
      docs: {
        description: {
          component:
            'A credential-only field that lets users choose an environment-variable reference or a masked inline secret. Applications supply the environment names and store the controlled value; an environment reference is serialized as `env:NAME`. Put it in a `FormField as="div" align="start"`. See the [Form guidance](?path=/docs/ui-forms-guidance--docs) for credential and picker rules.',
        },
      },
    },
  });
</script>

<script lang="ts">
  let secretReference = $state("env:BANK_API_TOKEN");
  let customReference = $state("");
</script>

<Story
  name="Changes from an environment key to an inline secret"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Inline" }));
    await userEvent.type(
      await canvas.findByPlaceholderText("Paste API key"),
      "sk_demo_123",
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Inline secret configured",
    );
  }}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-2xl">
      <FormField label="API key" as="div" align="start">
        <SecretField
          value={secretReference}
          {environmentKeys}
          label="API key"
          environmentPlaceholder="BANK_API_TOKEN"
          onChange={(value) => {
            secretReference = value;
          }}
        />
      </FormField>
      <output class="text-muted-foreground text-sm" aria-live="polite">
        {secretFieldMode(secretReference) === "env"
          ? `Environment key: ${secretReference.slice(4) || "Not selected"}`
          : secretReference
            ? "Inline secret configured"
            : "Secret not configured"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Accepts a custom environment key"
  tags={["skip-visual"]}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Environment" }));
    await userEvent.click(canvas.getByRole("button", { name: "API key" }));
    const page = within(canvasElement.ownerDocument.body);
    const query = page.getByPlaceholderText("Search project .env keys...");
    await userEvent.type(query, "PARTNER_TOKEN");
    await userEvent.click(page.getByRole("option", { name: /PARTNER_TOKEN/ }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "env:PARTNER_TOKEN",
    );
  }}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-2xl">
      <FormField label="API key" as="div" align="start">
        <SecretField
          value={customReference}
          {environmentKeys}
          label="API key"
          onChange={(value) => {
            customReference = value;
          }}
        />
      </FormField>
      <output class="text-muted-foreground text-sm" aria-live="polite">
        Stored reference: {customReference || "Not configured"}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Masks a read-only inline secret" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="cv-structured-form max-w-2xl">
      <FormField label="API key" as="div" align="start">
        <SecretField value="sk_live_private" label="API key" readOnly />
      </FormField>
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="cv-structured-form max-w-2xl">
      <FormField label="API key" as="div" align="start">
        <SecretField
          value=""
          {environmentKeys}
          label="API key"
          error="This field is required."
        />
      </FormField>
    </div>
  {/snippet}
</Story>
