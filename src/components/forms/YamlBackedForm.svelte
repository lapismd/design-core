<script lang="ts">
  import YamlEditor, { type YamlReviewDiff } from "./YamlEditor.svelte";

  import StructuredForm from "./StructuredForm.svelte";
  import type { FormConfig, FormValidationIssue, FormViewName } from "./types";

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

<style>
  .cv-yaml-backed-form {
    display: grid;
    gap: 0.75rem;
    min-width: 0;
  }

  .cv-yaml-backed-form--framed {
    border: 1px solid var(--cv-form-border, var(--border));
    border-radius: 0.35rem;
    background: var(
      --cv-form-panel-background,
      var(--cv-form-background, transparent)
    );
    padding: 0.75rem;
  }

  .cv-yaml-backed-form-error {
    margin: 0;
    color: var(--destructive);
    font-size: 0.8rem;
  }

  .cv-yaml-backed-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .cv-yaml-backed-form-actions button {
    min-height: 2rem;
    border: 1px solid var(--cv-form-border, var(--kanban-border, var(--border)));
    border-radius: 0.25rem;
    background: transparent;
    color: var(
      --cv-form-foreground,
      var(--kanban-foreground, var(--foreground))
    );
    cursor: pointer;
    font: inherit;
    font-size: 0.8rem;
    padding: 0 0.75rem;
  }

  .cv-yaml-backed-form-actions button.primary {
    border-color: color-mix(
      in srgb,
      var(--cv-form-accent, var(--card-color, var(--primary))) 45%,
      var(--cv-form-border, var(--border))
    );
    color: var(--cv-form-accent, var(--card-color, var(--primary)));
  }

  .cv-yaml-backed-form--framed .cv-yaml-backed-form-actions button.primary {
    background: var(--cv-form-accent, var(--card-color, var(--primary)));
    color: var(--cv-form-primary-foreground, white);
  }
</style>
