<script lang="ts">
  import "./JsonBackedForm.css";
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
    data-ui-component="json-backed-form"
    data-ui-part="json-backed-form"
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
