<script lang="ts">
  import {
    ListEditor,
    StructuredForm,
    createFormConfig,
    textField,
  } from "@stevejuma/ui/forms";
  import type { EducationEntry } from "../types";
  import "../cv-shared.css";

  let {
    education,
    onUpdate,
  }: {
    education: EducationEntry;
    onUpdate: (value: EducationEntry) => void;
  } = $props();

  const config = createFormConfig<EducationEntry>({
    id: "cv-education",
    fields: [
      textField({
        id: "institution",
        label: "Institution",
        get: (e) => e.institution,
        set: (e, institution) => ({ ...e, institution }),
      }),
      textField({
        id: "area",
        label: "Area",
        get: (e) => e.area,
        set: (e, area) => ({ ...e, area }),
      }),
      textField({
        id: "degree",
        label: "Degree",
        get: (e) => e.degree,
        set: (e, degree) => ({ ...e, degree }),
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
    ],
  });
</script>

<div class="cv-entry-editor" data-ui-part="education-editor">
  <StructuredForm
    value={education}
    {config}
    onChange={(next) => onUpdate(next as EducationEntry)}
  />
  <ListEditor
    label="Highlights"
    items={education.highlights ?? []}
    addLabel="highlight"
    onChange={(highlights) => onUpdate({ ...education, highlights })}
  />
</div>
