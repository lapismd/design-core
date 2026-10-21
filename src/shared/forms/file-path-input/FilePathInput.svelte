<!-- Adapted from JJ Store StoreModelFilePicker; Apache-2.0. -->
<script lang="ts">
  import { onDestroy } from "svelte";
  import * as ButtonGroup from "../../shadcn/button-group/index.js";
  import { Input } from "../../shadcn/input/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import FileIcon from "@lucide/svelte/icons/file";
  import "./file-path-input.css";

  let {
    id,
    label,
    value = $bindable(""),
    disabled = false,
    readonly = false,
    placeholder,
    maxLength = 4096,
    invalid = false,
    browseLabel = "Browse…",
    onBrowse,
    onBrowseError,
    onValueChange,
  }: {
    id: string;
    label: string;
    value?: string;
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    maxLength?: number;
    invalid?: boolean;
    browseLabel?: string;
    /** Host owns native dialogs, filters, permissions and filesystem access. Null cancels. */
    onBrowse?: () => Promise<string | null>;
    onBrowseError?: (error: unknown) => void;
    onValueChange?: (path: string) => void;
  } = $props();
  let pending = $state(false);
  let failed = $state(false);
  let generation = 0;
  $effect(() => {
    value;
    disabled;
    readonly;
    onBrowse;
    generation++;
    failed = false;
  });
  onDestroy(() => generation++);
  function update(path: string) {
    generation++;
    failed = false;
    value = path;
    onValueChange?.(path);
  }
  async function browse() {
    if (!onBrowse || disabled || readonly || pending) return;
    const request = ++generation;
    pending = true;
    failed = false;
    try {
      const path = await onBrowse();
      if (request === generation && !disabled && !readonly && path !== null)
        update(path);
    } catch (error) {
      if (request === generation) {
        if (onBrowseError) onBrowseError(error);
        else failed = true;
      }
    } finally {
      pending = false;
    }
  }
</script>

<div data-ui-component="file-path-input">
  <ButtonGroup.Root class="ui-file-path-input__group" aria-label={label}>
    <Input
      {id}
      aria-label={label}
      {value}
      {disabled}
      {readonly}
      {placeholder}
      maxlength={maxLength}
      aria-invalid={invalid || undefined}
      autocomplete="off"
      spellcheck={false}
      oninput={(event) => update(event.currentTarget.value)}
    />
    {#if onBrowse}<Button
        type="button"
        variant="outline"
        disabled={disabled || readonly || pending}
        aria-busy={pending}
        aria-label={`Browse ${label}`}
        onclick={browse}
        ><FileIcon data-icon="inline-start" aria-hidden="true" />{pending
          ? "Choosing…"
          : browseLabel}</Button
      >{/if}
  </ButtonGroup.Root>
  {#if failed}<p class="ui-file-path-input__error" role="alert">
      Unable to select a file. Try again.
    </p>{/if}
</div>
