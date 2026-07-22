<script lang="ts">
  import { FormField, ListEditor } from "@stevejuma/ui/forms";
  import type { CvLocale } from "../types";
  import TextControl from "../controls/TextControl.svelte";

  let {
    value = {},
    onChange,
  }: {
    value?: CvLocale;
    onChange: (value: CvLocale) => void;
  } = $props();

  function patch(partial: Partial<CvLocale>) {
    onChange({ ...value, ...partial });
  }
</script>

<div
  class="flex max-w-[646px] flex-col gap-6 py-4 pr-11 pl-10"
  data-ui-part="cv-locale-tab"
>
  <section class="flex flex-col gap-2">
    <h3 class="text-base font-semibold">Language</h3>
    <div class="cv-structured-form">
      <FormField as="div" label="Language">
        <TextControl
          label="Language"
          showLabel={false}
          value={value.language ?? ""}
          onChange={(language) => patch({ language })}
        />
      </FormField>
    </div>
  </section>

  <section class="flex flex-col gap-2">
    <h3 class="text-base font-semibold">Last updated phrases</h3>
    <div class="cv-structured-form">
      <FormField as="div" label="Present">
        <TextControl
          label="Present"
          showLabel={false}
          value={value.present ?? ""}
          onChange={(present) => patch({ present })}
        />
      </FormField>
      <FormField as="div" label="Month">
        <TextControl
          label="Month"
          showLabel={false}
          value={value.month ?? ""}
          onChange={(month) => patch({ month })}
        />
      </FormField>
      <FormField as="div" label="Months">
        <TextControl
          label="Months"
          showLabel={false}
          value={value.months ?? ""}
          onChange={(months) => patch({ months })}
        />
      </FormField>
      <FormField as="div" label="Years">
        <TextControl
          label="Years"
          showLabel={false}
          value={value.years ?? ""}
          onChange={(years) => patch({ years })}
        />
      </FormField>
      <FormField as="div" label="Degree with area">
        <TextControl
          label="Degree with area"
          showLabel={false}
          value={value.degree_with_area ?? ""}
          onChange={(degree_with_area) => patch({ degree_with_area })}
        />
      </FormField>
    </div>
  </section>

  <ListEditor
    label="Month abbreviations"
    items={value.month_abbreviations ?? []}
    addLabel="abbreviation"
    multiline={false}
    onChange={(month_abbreviations) => patch({ month_abbreviations })}
  />
  <ListEditor
    label="Month names"
    items={value.month_names ?? []}
    addLabel="name"
    multiline={false}
    onChange={(month_names) => patch({ month_names })}
  />
</div>
