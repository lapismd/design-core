<script lang="ts">
  import "./YamlBackedForm.css";
  import YamlEditor, {
    type YamlReviewDiff,
  } from "../yaml-editor/YamlEditor.svelte";

  import StructuredForm from "./StructuredForm.svelte";
  import type {
    FormConfig,
    FormValidationIssue,
    FormViewName,
  } from "../core/types";

  type AnyFormConfig = FormConfig<any, any>;

  let {
    value = undefined,
    config = undefined,
    view = config?.defaultView ?? "edit",
    context = undefined,
    issues = [],
    readonly = false,
    yamlMode = false,
    yamlText = $bindable(""),
    yamlError = "",
    yamlLabel = "YAML editor",
    yamlMinHeight = "18rem",
    yamlFramed = false,
    yamlResetLabel = "Reset",
    yamlApplyLabel = "Apply YAML",
    reviewDiffs = [],
    onUndoReview,
    onKeepReview,
    onChange = () => {},
    onYamlChange = () => {},
    onYamlApply = () => {},
    onYamlReset = () => {},
  }: {
    value?: unknown;
    config?: AnyFormConfig;
    view?: FormViewName;
    context?: unknown;
    issues?: FormValidationIssue[];
    readonly?: boolean;
    yamlMode?: boolean;
    yamlText?: string;
    yamlError?: string;
    yamlLabel?: string;
    yamlMinHeight?: string;
    yamlFramed?: boolean;
    yamlResetLabel?: string;
    yamlApplyLabel?: string;
    reviewDiffs?: YamlReviewDiff[];
    onUndoReview?: (id: string) => void;
    onKeepReview?: (id: string) => void;
    onChange?: (value: unknown) => void | Promise<void>;
    onYamlChange?: (value: string) => void | Promise<void>;
    onYamlApply?: () => void | Promise<void>;
    onYamlReset?: () => void | Promise<void>;
  } = $props();

  function handleYamlChange(value: string) {
    void onYamlChange(value);
  }

  function handleYamlApply() {
    void onYamlApply();
  }

  function handleYamlReset() {
    void onYamlReset();
  }
</script>

{#if yamlMode}
  <div
    class="cv-yaml-backed-form"
    class:cv-yaml-backed-form--framed={yamlFramed}
    data-ui-component="yaml-backed-form"
    data-ui-part="yaml-backed-form"
  >
    <YamlEditor
      bind:value={yamlText}
      invalid={Boolean(yamlError)}
      minHeight={yamlMinHeight}
      ariaLabel={yamlLabel}
      {reviewDiffs}
      {onUndoReview}
      {onKeepReview}
      onChange={handleYamlChange}
    />
    {#if yamlError}
      <p class="cv-yaml-backed-form-error">{yamlError}</p>
    {/if}
    <div class="cv-yaml-backed-form-actions">
      <button type="button" onclick={handleYamlReset}>{yamlResetLabel}</button>
      <button type="button" class="primary" onclick={handleYamlApply}
        >{yamlApplyLabel}</button
      >
    </div>
  </div>
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
