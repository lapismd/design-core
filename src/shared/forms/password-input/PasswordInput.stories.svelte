<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import FormField from "../form-field/FormField.svelte";
  import { Basic } from "./PasswordInput.example-sources";
  import PasswordInput from "./PasswordInput.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Password Input",
    component: PasswordInput,
    parameters: {
      docs: {
        description: {
          component:
            "A masked secret field with an inline Input Group reveal toggle. Settings string fields use this through `presentation: \"password\"`. Secret Field remains the env-or-inline credential control.",
        },
        source: { code: Basic, language: "svelte", type: "code" },
      },
    },
  });
</script>

<script lang="ts">
  let token = $state("shared-secret");
</script>

<Story
  name="Reveals and hides a masked value"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const field = canvas.getByLabelText("Auth token", { selector: "input" });
    await expect(field).toHaveAttribute("type", "password");
    await expect(field).toHaveValue("shared-secret");
    const reveal = canvas.getByRole("button", { name: "Show value" });
    await expect(reveal).toHaveAttribute("data-size", "icon-xs");
    await userEvent.click(reveal);
    await expect(field).toHaveAttribute("type", "text");
    await expect(field).toHaveValue("shared-secret");
    await userEvent.click(canvas.getByRole("button", { name: "Hide value" }));
    await expect(field).toHaveAttribute("type", "password");
  }}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-sm">
      <FormField label="Auth token" as="div" align="start">
        <PasswordInput
          id="auth-token"
          bind:value={token}
          placeholder="Shared token"
          aria-label="Auth token"
        />
      </FormField>
    </div>
  {/snippet}
</Story>
