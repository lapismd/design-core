<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Basic } from "./PasswordInput.example-sources";
  import PasswordInput from "./PasswordInput.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Password Input",
    component: PasswordInput,
    parameters: {
      docs: {
        description: {
          component:
            "A masked secret field that looks like a single Input, with a borderless overlay reveal. Settings string fields use this through `presentation: \"password\"`. Secret Field remains the env-or-inline credential control.",
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
    const field = canvas.getByLabelText("Auth token");
    await expect(field).toHaveAttribute("type", "password");
    await expect(field).toHaveValue("shared-secret");
    expect(getComputedStyle(field).borderTopColor).not.toBe("rgba(0, 0, 0, 0)");
    await userEvent.type(field, "{End}");
    await expect(field).toHaveFocus();
    expect(getComputedStyle(field).borderTopColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(field).boxShadow).not.toBe("none");
    const reveal = canvas.getByRole("button", { name: "Show value" });
    expect(getComputedStyle(reveal).borderTopWidth).toBe("0px");
    const fieldBox = field.getBoundingClientRect();
    const revealBox = reveal.getBoundingClientRect();
    expect(revealBox.left).toBeGreaterThanOrEqual(fieldBox.left);
    expect(revealBox.right).toBeLessThanOrEqual(fieldBox.right + 1);
    expect(revealBox.top).toBeGreaterThanOrEqual(fieldBox.top);
    expect(revealBox.bottom).toBeLessThanOrEqual(fieldBox.bottom + 1);
    await userEvent.click(reveal);
    await expect(field).toHaveAttribute("type", "text");
    await expect(field).toHaveValue("shared-secret");
    await userEvent.click(canvas.getByRole("button", { name: "Hide value" }));
    await expect(field).toHaveAttribute("type", "password");
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2">
      <label class="text-sm font-medium" for="auth-token">Auth token</label>
      <PasswordInput
        id="auth-token"
        bind:value={token}
        placeholder="Shared token"
      />
    </div>
  {/snippet}
</Story>
