<script lang="ts">
  import {
    EntryActions,
    FormField,
    ListEditor,
    StructuredForm,
    createFormConfig,
    textField,
    textareaField,
  } from "@stevejuma/ui/forms";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type {
    ExperienceEntry,
    ExperienceExtraDetail,
    ExperienceRoleHistoryEntry,
  } from "../types";

  let {
    experience,
    onUpdate,
  }: {
    experience: ExperienceEntry;
    onUpdate: (value: ExperienceEntry) => void;
  } = $props();

  const detailsConfig = createFormConfig<ExperienceEntry>({
    id: "cv-experience-details",
    fields: [
      textField({
        id: "company",
        label: "Company",
        get: (e) => e.company,
        set: (e, company) => ({ ...e, company }),
      }),
      textField({
        id: "position",
        label: "Position",
        get: (e) => e.position,
        set: (e, position) => ({ ...e, position }),
      }),
      textField({
        id: "display_date",
        label: "Date",
        get: (e) => e.display_date ?? "",
        set: (e, display_date) => ({ ...e, display_date }),
      }),
      textField({
        id: "start_date",
        label: "Start date",
        get: (e) => e.start_date,
        set: (e, start_date) => ({ ...e, start_date }),
      }),
      textField({
        id: "end_date",
        label: "End date",
        get: (e) => e.end_date,
        set: (e, end_date) => ({ ...e, end_date }),
      }),
      textField({
        id: "location",
        label: "Location",
        get: (e) => e.location,
        set: (e, location) => ({ ...e, location }),
      }),
      textareaField({
        id: "summary",
        label: "Summary",
        get: (e) => e.summary ?? "",
        set: (e, summary) => ({ ...e, summary }),
      }),
    ],
  });

  function patch(partial: Partial<ExperienceEntry>) {
    onUpdate({ ...experience, ...partial });
  }

  function updateRole(index: number, value: ExperienceRoleHistoryEntry) {
    const role_history = [...(experience.role_history ?? [])];
    role_history[index] = value;
    patch({ role_history });
  }

  function addRole() {
    patch({
      role_history: [
        ...(experience.role_history ?? []),
        { position: "", start_date: "", end_date: "" },
      ],
    });
  }

  function removeRole(index: number) {
    patch({
      role_history: (experience.role_history ?? []).filter(
        (_, i) => i !== index,
      ),
    });
  }

  function updateExtra(index: number, value: ExperienceExtraDetail) {
    const extra_details = [...(experience.extra_details ?? [])];
    extra_details[index] = value;
    patch({ extra_details });
  }

  function addExtra() {
    patch({
      extra_details: [
        ...(experience.extra_details ?? []),
        {
          id: `extra-${Date.now()}`,
          title: "Extra detail",
          content_type: "text",
          enabled: true,
          text: "",
        },
      ],
    });
  }

  function removeExtra(index: number) {
    patch({
      extra_details: (experience.extra_details ?? []).filter(
        (_, i) => i !== index,
      ),
    });
  }
</script>

<div class="flex flex-col gap-4" data-ui-part="experience-editor">
  <StructuredForm
    value={experience}
    config={detailsConfig}
    onChange={(next) => onUpdate(next as ExperienceEntry)}
  />

  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-medium">Role history</h4>
      <Button type="button" variant="ghost" size="xs" onclick={addRole}>
        Add role
      </Button>
    </div>
    {#each experience.role_history ?? [] as role, index (index)}
      <EntryActions
        {index}
        total={(experience.role_history ?? []).length}
        onRemove={() => removeRole(index)}
      >
        <div class="cv-structured-form">
          <FormField label="Position">
            <input
              aria-label={`Role history position ${index + 1}`}
              value={role.position}
              oninput={(event) =>
                updateRole(index, {
                  ...role,
                  position: event.currentTarget.value,
                })}
            />
          </FormField>
          <FormField label="Start date">
            <input
              aria-label={`Role history start ${index + 1}`}
              value={role.start_date ?? ""}
              oninput={(event) =>
                updateRole(index, {
                  ...role,
                  start_date: event.currentTarget.value,
                })}
            />
          </FormField>
          <FormField label="End date">
            <input
              aria-label={`Role history end ${index + 1}`}
              value={role.end_date ?? ""}
              oninput={(event) =>
                updateRole(index, {
                  ...role,
                  end_date: event.currentTarget.value,
                })}
            />
          </FormField>
        </div>
      </EntryActions>
    {/each}
  </section>

  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-medium">Extra details</h4>
      <Button type="button" variant="ghost" size="xs" onclick={addExtra}>
        Add detail
      </Button>
    </div>
    {#each experience.extra_details ?? [] as detail, index (detail.id)}
      <EntryActions
        {index}
        total={(experience.extra_details ?? []).length}
        onRemove={() => removeExtra(index)}
      >
        <div class="cv-structured-form">
          <FormField label="Title">
            <input
              aria-label={`Extra detail title ${index + 1}`}
              value={detail.title}
              oninput={(event) =>
                updateExtra(index, {
                  ...detail,
                  title: event.currentTarget.value,
                })}
            />
          </FormField>
          {#if detail.content_type === "text"}
            <FormField label="Text">
              <textarea
                aria-label={`Extra detail text ${index + 1}`}
                rows="2"
                value={detail.text ?? ""}
                oninput={(event) =>
                  updateExtra(index, {
                    ...detail,
                    text: event.currentTarget.value,
                  })}
              ></textarea>
            </FormField>
          {:else}
            <ListEditor
              label="Items"
              items={detail.items ?? []}
              addLabel="item"
              onChange={(items) => updateExtra(index, { ...detail, items })}
            />
          {/if}
        </div>
      </EntryActions>
    {/each}
  </section>

  <ListEditor
    label="Highlights"
    items={experience.highlights}
    addLabel="highlight"
    onChange={(highlights) => patch({ highlights })}
  />
</div>
