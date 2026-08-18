<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import type { InputProps } from "@lapismd/design-core/shadcn/input";
  import * as InputGroup from "@lapismd/design-core/shadcn/input-group";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import EyeOffIcon from "@lucide/svelte/icons/eye-off";

  type PasswordInputProps = Omit<InputProps, "type" | "files" | "value"> & {
    value?: string;
  };

  let {
    id,
    value = $bindable(""),
    placeholder,
    disabled = false,
    autocomplete = "off",
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    oninput,
    ...restProps
  }: PasswordInputProps = $props();

  let revealed = $state(false);
  const revealLabel = $derived(revealed ? "Hide value" : "Show value");
</script>

<div data-ui-component="password-input" data-ui-part="password-input">
  <InputGroup.Root>
    <InputGroup.Input
      {id}
      type={revealed ? "text" : "password"}
      bind:value
      {placeholder}
      {disabled}
      {autocomplete}
      spellcheck={false}
      aria-invalid={ariaInvalid}
      aria-label={ariaLabel}
      {oninput}
      {...restProps}
    />
    <InputGroup.Addon align="inline-end">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={revealLabel}
        aria-pressed={revealed}
        {disabled}
        onclick={() => {
          revealed = !revealed;
        }}
      >
        {#if revealed}
          <EyeOffIcon />
        {:else}
          <EyeIcon />
        {/if}
      </Button>
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
