<script lang="ts">
  import StructuredForm from "./StructuredForm.svelte";
  import type { FormConfig, FormValidationIssue, FormViewName } from "../core/types";

  type AnyFormConfig = FormConfig<any, any>;

  let {
    value,
    config,
    view = config.defaultView ?? "preview",
    context = undefined,
    issues = [],
    readonly = view !== "edit",
    onChange = () => {},
  }: {
    value: unknown;
    config: AnyFormConfig;
    view?: FormViewName;
    context?: unknown;
    issues?: FormValidationIssue[];
    readonly?: boolean;
    onChange?: (value: unknown) => void | Promise<void>;
  } = $props();
</script>

<StructuredForm
  {value}
  {config}
  {view}
  {context}
  {issues}
  {readonly}
  {onChange}
/>
