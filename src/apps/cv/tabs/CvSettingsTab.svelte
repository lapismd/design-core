<script lang="ts">
  import { FormField, ListEditor } from "@stevejuma/ui/forms";
  import type { CvSettings } from "../types";
  import TextControl from "../controls/TextControl.svelte";
  import SwitchControl from "../controls/SwitchControl.svelte";

  let {
    value = {},
    onChange,
  }: {
    value?: CvSettings;
    onChange: (value: CvSettings) => void;
  } = $props();

  function patch(partial: Partial<CvSettings>) {
    onChange({ ...value, ...partial });
  }

  let showKeywords = $state(true);
</script>

<div
  class="flex max-w-[646px] flex-col gap-6 py-4 pr-11 pl-10"
  data-ui-part="cv-settings-tab"
>
  <div class="cv-structured-form">
    <FormField as="div" label="Current date">
      <TextControl
        label="Current date"
        showLabel={false}
        value={value.current_date ?? ""}
        onChange={(current_date) => patch({ current_date })}
      />
    </FormField>
    <FormField as="div" label="PDF title">
      <TextControl
        label="PDF title"
        showLabel={false}
        value={value.pdf_title ?? ""}
        onChange={(pdf_title) => patch({ pdf_title })}
      />
    </FormField>
    <FormField as="div" label="Show bold keywords" align="center">
      <SwitchControl
        label="Show bold keywords"
        showLabel={false}
        checked={showKeywords}
        onCheckedChange={(checked) => {
          showKeywords = checked;
        }}
      />
    </FormField>
  </div>

  {#if showKeywords}
    <ListEditor
      label="Bold keywords"
      items={value.bold_keywords ?? []}
      addLabel="keyword"
      multiline={false}
      onChange={(bold_keywords) => patch({ bold_keywords })}
    />
  {/if}
</div>
