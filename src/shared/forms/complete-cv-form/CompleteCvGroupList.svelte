<script lang="ts">
  import FormSectionHeader from "../form-section-header/FormSectionHeader.svelte";
  import StructuredForm from "../structured-form/StructuredForm.svelte";
  import {
    storyFormConfig,
    type StoryFormGroup,
  } from "./complete-cv-form.config";
  import type { StoryRecord } from "./complete-cv-form.types";

  let {
    value,
    groups,
    closedIds,
    onChange,
    onClosedIdsChange,
  }: {
    value: StoryRecord;
    groups: StoryFormGroup[];
    closedIds: string[];
    onChange: (value: StoryRecord) => void;
    onClosedIdsChange: (ids: string[]) => void;
  } = $props();

  const configs = $derived(
    groups.map((group) => storyFormConfig(group.id, group.fields)),
  );

  function open(id: string): boolean {
    return !closedIds.includes("*") && !closedIds.includes(id);
  }

  function toggle(id: string): void {
    const withoutAll = closedIds.filter((item) => item !== "*");
    onClosedIdsChange(
      open(id) ? [...withoutAll, id] : withoutAll.filter((item) => item !== id),
    );
  }
</script>

<div class="complete-cv-group-list">
  {#each groups as group, index (group.id)}
    <section
      class="complete-cv-group complete-cv-settings-group"
      data-testid={`group-${group.id}`}
    >
      <FormSectionHeader
        title={group.title}
        disclosureTitle={group.title}
        {index}
        total={groups.length}
        open={open(group.id)}
        editable={false}
        movable={false}
        removable={false}
        titleToggleable
        titleRowClass="complete-cv-setting-title-row"
        onToggle={() => toggle(group.id)}
      />
      {#if open(group.id)}
        <div class="complete-cv-group__body">
          <StructuredForm
            {value}
            config={configs[index]}
            onChange={(next) => onChange(next as StoryRecord)}
          />
        </div>
      {/if}
    </section>
  {/each}
</div>
