<script lang="ts">
  import type { Snippet } from "svelte";

  import CodeEditor from "../code-editor/CodeEditor.svelte";
  import type {
    FormConfig,
    FormValidationIssue,
    FormViewName,
  } from "../core/types";
  import StructuredForm from "./StructuredForm.svelte";

  type AnyFormConfig = FormConfig<any, any>;

  let {
    value = undefined,
    config = undefined,
    view = config?.defaultView ?? "edit",
    context = undefined,
    issues = [],
    readonly = false,
    jsonMode = false,
    jsonText = $bindable(""),
    jsonError = "",
    jsonLabel = "JSON source editor",
    jsonMinHeight = "24rem",
    jsonFramed = false,
    jsonResetLabel = "Reset",
    jsonApplyLabel = "Apply JSON",
    onChange = () => {},
    onJsonChange = () => {},
    onJsonApply = () => {},
    onJsonReset = () => {},
    children,
  }: {
    value?: unknown;
    config?: AnyFormConfig;
    view?: FormViewName;
    context?: unknown;
    issues?: FormValidationIssue[];
    readonly?: boolean;
    jsonMode?: boolean;
    jsonText?: string;
    jsonError?: string;
    jsonLabel?: string;
    jsonMinHeight?: string;
    jsonFramed?: boolean;
    jsonResetLabel?: string;
    jsonApplyLabel?: string;
    onChange?: (value: unknown) => void | Promise<void>;
    onJsonChange?: (value: string) => void | Promise<void>;
    onJsonApply?: () => void | Promise<void>;
    onJsonReset?: () => void | Promise<void>;
    children?: Snippet;
  } = $props();

  function handleJsonChange(next: string) {
    void onJsonChange(next);
  }

  function handleJsonApply() {
    void onJsonApply();
  }

  function handleJsonReset() {
    void onJsonReset();
  }
</script>

{#if jsonMode}
  <div
    class="ui-json-backed-form"
    class:ui-json-backed-form--framed={jsonFramed}
  >
    <CodeEditor
      bind:value={jsonText}
      language="json"
      minHeight={jsonMinHeight}
      ariaLabel={jsonLabel}
      onChange={handleJsonChange}
    />
    {#if jsonError}
      <p class="ui-json-backed-form-error" role="alert">{jsonError}</p>
    {/if}
    <div class="ui-json-backed-form-actions">
      <button type="button" onclick={handleJsonReset}>{jsonResetLabel}</button>
      <button type="button" class="primary" onclick={handleJsonApply}
        >{jsonApplyLabel}</button
      >
    </div>
  </div>
{:else if children}
  {@render children()}
{:else if config}
  <StructuredForm
    {value}
    {config}
    {view}
    {context}
    {issues}
    {readonly}
    {onChange}
  />
{/if}

<style>
  .ui-json-backed-form {
    display: grid;
    gap: 0.75rem;
    min-width: 0;
  }

  .ui-json-backed-form--framed {
    border: 1px solid var(--ui-form-border);
    border-radius: 0.35rem;
    background: var(--ui-form-panel-background);
    padding: 0.75rem;
  }

  .ui-json-backed-form-error {
    margin: 0;
    color: var(--destructive);
    font-size: 0.8rem;
  }

  .ui-json-backed-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .ui-json-backed-form-actions button {
    min-height: 2rem;
    border: 1px solid var(--ui-form-border);
    border-radius: 0.25rem;
    background: transparent;
    color: var(--ui-form-foreground);
    cursor: pointer;
    font: inherit;
    font-size: 0.8rem;
    padding: 0 0.75rem;
  }

  .ui-json-backed-form-actions button.primary {
    border-color: color-mix(
      in srgb,
      var(--ui-form-accent) 45%,
      var(--ui-form-border)
    );
    color: var(--ui-form-accent);
  }

  .ui-json-backed-form--framed .ui-json-backed-form-actions button.primary {
    background: var(--ui-form-accent);
    color: var(--ui-form-primary-foreground);
  }
</style>
