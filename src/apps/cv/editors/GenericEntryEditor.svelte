<script lang="ts">
  import {
    FormField,
    ListEditor,
    StructuredForm,
    createFormConfig,
    textField,
    textareaField,
  } from "@stevejuma/ui/forms";
  import type {
    CvEntry,
    CvEntryType,
    EducationEntry,
    ExperienceEntry,
    NormalEntry,
    OneLineEntry,
    PublicationEntry,
  } from "../types";
  import "../cv-shared.css";
  import EducationEditor from "./EducationEditor.svelte";
  import ExperienceEditor from "./ExperienceEditor.svelte";

  let {
    entryType,
    entry,
    onUpdate,
  }: {
    entryType: CvEntryType;
    entry: CvEntry;
    onUpdate: (value: CvEntry) => void;
  } = $props();

  const publicationConfig = createFormConfig<PublicationEntry>({
    id: "cv-publication",
    fields: [
      textField({
        id: "title",
        label: "Title",
        get: (e) => e.title,
        set: (e, title) => ({ ...e, title }),
      }),
      textField({
        id: "journal",
        label: "Journal",
        get: (e) => e.journal ?? "",
        set: (e, journal) => ({ ...e, journal }),
      }),
      textField({
        id: "date",
        label: "Date",
        get: (e) => e.date ?? "",
        set: (e, date) => ({ ...e, date }),
      }),
      textField({
        id: "doi",
        label: "DOI",
        get: (e) => e.doi ?? "",
        set: (e, doi) => ({ ...e, doi }),
      }),
      textField({
        id: "url",
        label: "URL",
        get: (e) => e.url ?? "",
        set: (e, url) => ({ ...e, url }),
      }),
      textareaField({
        id: "summary",
        label: "Summary",
        get: (e) => e.summary ?? "",
        set: (e, summary) => ({ ...e, summary }),
      }),
    ],
  });

  const oneLineConfig = createFormConfig<OneLineEntry>({
    id: "cv-one-line",
    fields: [
      textField({
        id: "label",
        label: "Label",
        get: (e) => e.label,
        set: (e, label) => ({ ...e, label }),
      }),
      textField({
        id: "details",
        label: "Details",
        get: (e) => e.details,
        set: (e, details) => ({ ...e, details }),
      }),
    ],
  });

  const normalConfig = createFormConfig<NormalEntry>({
    id: "cv-normal",
    fields: [
      textField({
        id: "name",
        label: "Name",
        get: (e) => e.name,
        set: (e, name) => ({ ...e, name }),
      }),
      textField({
        id: "url",
        label: "URL",
        get: (e) => e.url ?? "",
        set: (e, url) => ({ ...e, url }),
      }),
      textField({
        id: "date",
        label: "Date",
        get: (e) => e.date ?? "",
        set: (e, date) => ({ ...e, date }),
      }),
      textField({
        id: "start_date",
        label: "Start date",
        get: (e) => e.start_date ?? "",
        set: (e, start_date) => ({ ...e, start_date }),
      }),
      textField({
        id: "end_date",
        label: "End date",
        get: (e) => e.end_date ?? "",
        set: (e, end_date) => ({ ...e, end_date }),
      }),
      textField({
        id: "location",
        label: "Location",
        get: (e) => e.location ?? "",
        set: (e, location) => ({ ...e, location }),
      }),
      textareaField({
        id: "summary",
        label: "Summary",
        get: (e) => e.summary,
        set: (e, summary) => ({ ...e, summary }),
      }),
    ],
  });
</script>

{#if entryType === "TextEntry"}
  <FormField label="Text">
    <textarea
      aria-label="Text entry"
      rows="4"
      value={typeof entry === "string" ? entry : ""}
      oninput={(event) => onUpdate(event.currentTarget.value)}
    ></textarea>
  </FormField>
{:else if entryType === "ExperienceEntry"}
  <ExperienceEditor experience={entry as ExperienceEntry} {onUpdate} />
{:else if entryType === "EducationEntry"}
  <EducationEditor education={entry as EducationEntry} {onUpdate} />
{:else if entryType === "PublicationEntry"}
  {@const publication = entry as PublicationEntry}
  <div class="cv-entry-editor">
    <StructuredForm
      value={publication}
      config={publicationConfig}
      onChange={(next) => onUpdate(next as PublicationEntry)}
    />
    <ListEditor
      label="Authors"
      items={publication.authors}
      addLabel="author"
      onChange={(authors) => onUpdate({ ...publication, authors })}
    />
  </div>
{:else if entryType === "OneLineEntry"}
  <StructuredForm
    value={entry as OneLineEntry}
    config={oneLineConfig}
    onChange={(next) => onUpdate(next as OneLineEntry)}
  />
{:else if entryType === "BulletEntry" || entryType === "NumberedEntry" || entryType === "ReversedNumberedEntry"}
  <!-- Handled by CvSectionsForm simple-list branch -->
  <p class="cv-generic-entry-editor__hint">Use the section list editor.</p>
{:else}
  {@const normal = entry as NormalEntry}
  <div class="cv-entry-editor">
    <StructuredForm
      value={normal}
      config={normalConfig}
      onChange={(next) => onUpdate(next as NormalEntry)}
    />
    <ListEditor
      label="Highlights"
      items={normal.highlights ?? []}
      addLabel="highlight"
      onChange={(highlights) => onUpdate({ ...normal, highlights })}
    />
  </div>
{/if}

<style>
  .cv-generic-entry-editor__hint {
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }
</style>
