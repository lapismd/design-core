<script lang="ts">
  import "./PasswordInput.css";
  import { Input, type InputProps } from "@lapismd/design-core/shadcn/input";
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
  <Input
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
  <button
    type="button"
    data-ui-part="reveal"
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
  </button>
</div>
