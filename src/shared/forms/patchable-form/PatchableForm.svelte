<script lang="ts">
  import type { YamlReviewDiff } from "../yaml-editor/YamlEditor.svelte";
  import YamlBackedForm from "../yaml-backed-form/YamlBackedForm.svelte";
  import type {
    FormConfig,
    FormValidationIssue,
    FormViewName,
  } from "../core/types";
  import {
    acceptedJsonReviewValue,
    acceptedReviewChanges,
    previewJsonReviewValue,
    reviewIsResolved,
    setReviewChangeStatus,
    type FormReviewState,
  } from "../core/patch-review";
  import { fieldReviewContextFromReview } from "./field-review-context";

  type AnyFormConfig = FormConfig<any, any>;

  let {
    value,
    config,
    view = config?.defaultView ?? "edit",
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
    review = null,
    pathPrefix = "",
    toYamlDiffs,
    onReviewChange,
    onChange = () => {},
    onYamlChange = () => {},
    onYamlApply = () => {},
    onYamlReset = () => {},
  }: {
    value: unknown;
    config?: AnyFormConfig;
    view?: FormViewName;
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
    /** Controlled pending/accepted/rejected review session. */
    review?: FormReviewState<any> | null;
    /** JSON Pointer prefix for field ids, e.g. `""` → `/name`, `"/cv"` → `/cv/name`. */
    pathPrefix?: string;
    /** Host-owned YAML hunks for CodeMirror review widgets. */
    toYamlDiffs?: (review: FormReviewState<any>) => YamlReviewDiff[];
    onReviewChange?: (review: FormReviewState<any> | null) => void;
    onChange?: (value: unknown) => void | Promise<void>;
    onYamlChange?: (value: string) => void | Promise<void>;
    onYamlApply?: () => void | Promise<void>;
    onYamlReset?: () => void | Promise<void>;
  } = $props();

  const displayValue = $derived(
    review ? previewJsonReviewValue(review) : value,
  );

  const reviewDiffs = $derived.by((): YamlReviewDiff[] => {
    if (!review || !toYamlDiffs) return [];
    return toYamlDiffs(review).filter((diff) => diff.status === "pending");
  });

  function resolveReview(next: FormReviewState<any>) {
    if (!reviewIsResolved(next)) {
      onReviewChange?.(next);
      return;
    }
    if (acceptedReviewChanges(next).length) {
      void onChange(acceptedJsonReviewValue(next));
    } else {
      void onChange(next.baseValue);
    }
    onReviewChange?.(null);
  }

  function handleKeep(changeId: string) {
    if (!review) return;
    resolveReview(setReviewChangeStatus(review, changeId, "accepted"));
  }

  function handleUndo(changeId: string) {
    if (!review) return;
    resolveReview(setReviewChangeStatus(review, changeId, "rejected"));
  }

  const reviewContext = $derived(
    fieldReviewContextFromReview(review, handleKeep, handleUndo, pathPrefix),
  );

  function handleFormChange(next: unknown) {
    if (review) return;
    void onChange(next);
  }
</script>

<div data-ui-part="patchable-form" data-ui-component="patchable-form">
  <YamlBackedForm
    value={displayValue}
    {config}
    {view}
    context={reviewContext}
    {issues}
    {readonly}
    {yamlMode}
    bind:yamlText
    {yamlError}
    {yamlLabel}
    {yamlMinHeight}
    {yamlFramed}
    {yamlResetLabel}
    {yamlApplyLabel}
    {reviewDiffs}
    onKeepReview={handleKeep}
    onUndoReview={handleUndo}
    onChange={handleFormChange}
    {onYamlChange}
    {onYamlApply}
    {onYamlReset}
  />
</div>
