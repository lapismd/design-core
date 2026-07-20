<script lang="ts">
  import {
    FormField,
    FormSectionHeader,
    ListEditor,
    ReferencePicker,
    SegmentedControl,
  } from "@stevejuma/ui/forms";
  import type { CvEvidence, EvidenceStory } from "../types";

  let {
    value = { technologies: [], skills: [], stories: [] },
    onChange,
  }: {
    value?: CvEvidence;
    onChange: (value: CvEvidence) => void;
  } = $props();

  let storyOpen = $state<Record<string, boolean>>({});
  let addOpen = $state(false);

  const referenceIndex = {
    references: [
      {
        id: "1",
        ref: "[^1]",
        marker: "1",
        path: "/stories/deploy-pipeline",
        type: "story" as const,
        label: "Deployment story",
        excerpt: "Shipped the deploy pipeline",
        duplicate: false,
      },
    ],
    duplicates: {},
  };

  function patch(partial: Partial<CvEvidence>) {
    onChange({ ...value, ...partial });
  }

  function updateStory(index: number, story: EvidenceStory) {
    const stories = [...(value.stories ?? [])];
    stories[index] = story;
    patch({ stories });
  }
</script>

<div class="flex max-w-[646px] flex-col gap-6 py-4 pr-11 pl-10" data-ui-part="cv-evidence-tab">
  <ListEditor
    label="Technologies"
    items={value.technologies ?? []}
    addLabel="technology"
    onChange={(technologies) => patch({ technologies })}
  />
  <ListEditor
    label="Skills"
    items={value.skills ?? []}
    addLabel="skill"
    onChange={(skills) => patch({ skills })}
  />

  {#each value.stories ?? [] as story, index (story.id)}
    {@const open = storyOpen[story.id] ?? true}
    <section class="flex flex-col gap-3">
      <FormSectionHeader
        title={story.title}
        {index}
        total={(value.stories ?? []).length}
        editable={true}
        titleToggleable={false}
        {open}
        onTitleChange={(title) => updateStory(index, { ...story, title })}
        onToggle={() => {
          storyOpen = { ...storyOpen, [story.id]: !open };
        }}
      />
      {#if open}
        <div class="cv-structured-form">
          <FormField label="ID">
            <input
              aria-label="Story ID"
              value={story.id}
              oninput={(event) =>
                updateStory(index, { ...story, id: event.currentTarget.value })}
            />
          </FormField>
          <FormField as="div" label="Status" align="center">
            <SegmentedControl
              value={story.status}
              options={["draft", "ready", "archived"]}
              labels={{
                draft: "Draft",
                ready: "Ready",
                archived: "Archived",
              }}
              ariaLabel="Status"
              onChange={(status) =>
                updateStory(index, {
                  ...story,
                  status: status as EvidenceStory["status"],
                })}
            />
          </FormField>
          <FormField as="div" label="Visibility" align="center">
            <SegmentedControl
              value={story.visibility}
              options={["internal", "public"]}
              labels={{
                internal: "Internal",
                public: "Public",
              }}
              ariaLabel="Visibility"
              onChange={(visibility) =>
                updateStory(index, {
                  ...story,
                  visibility: visibility as EvidenceStory["visibility"],
                })}
            />
          </FormField>
          <FormField label="Notes">
            <textarea
              aria-label="Notes"
              rows="2"
              value={story.notes ?? ""}
              oninput={(event) =>
                updateStory(index, {
                  ...story,
                  notes: event.currentTarget.value,
                })}
            ></textarea>
          </FormField>
        </div>

        <ListEditor
          label="Tags"
          items={story.tags ?? []}
          addLabel="tag"
          onChange={(tags) => updateStory(index, { ...story, tags })}
        />
        <ListEditor
          label="Useful for"
          items={story.useful_for ?? []}
          addLabel="use"
          onChange={(useful_for) => updateStory(index, { ...story, useful_for })}
        />

        <ReferencePicker
          refs={story.source_refs ?? []}
          {addOpen}
          {referenceIndex}
          onAddOpenChange={(openNext) => {
            addOpen = openNext;
          }}
          onChange={(source_refs) => updateStory(index, { ...story, source_refs })}
        />

        <div class="cv-structured-form">
          <FormField label="Context">
            <textarea
              aria-label="Context"
              rows="2"
              value={story.evidence?.context ?? ""}
              oninput={(event) =>
                updateStory(index, {
                  ...story,
                  evidence: {
                    ...story.evidence,
                    context: event.currentTarget.value,
                  },
                })}
            ></textarea>
          </FormField>
          <FormField label="Problem">
            <textarea
              aria-label="Problem"
              rows="2"
              value={story.evidence?.problem ?? ""}
              oninput={(event) =>
                updateStory(index, {
                  ...story,
                  evidence: {
                    ...story.evidence,
                    problem: event.currentTarget.value,
                  },
                })}
            ></textarea>
          </FormField>
        </div>

        <ListEditor
          label="Actions"
          items={story.evidence?.actions ?? []}
          addLabel="action"
          onChange={(actions) =>
            updateStory(index, {
              ...story,
              evidence: { ...story.evidence, actions },
            })}
        />
        <ListEditor
          label="Results"
          items={story.evidence?.results ?? []}
          addLabel="result"
          onChange={(results) =>
            updateStory(index, {
              ...story,
              evidence: { ...story.evidence, results },
            })}
        />

        <div class="cv-structured-form">
          <FormField label="STAR situation">
            <textarea
              aria-label="STAR situation"
              rows="2"
              value={story.answer_versions?.star?.situation ?? ""}
              oninput={(event) =>
                updateStory(index, {
                  ...story,
                  answer_versions: {
                    ...story.answer_versions,
                    star: {
                      ...story.answer_versions?.star,
                      situation: event.currentTarget.value,
                    },
                  },
                })}
            ></textarea>
          </FormField>
          <FormField label="STAR task">
            <textarea
              aria-label="STAR task"
              rows="2"
              value={story.answer_versions?.star?.task ?? ""}
              oninput={(event) =>
                updateStory(index, {
                  ...story,
                  answer_versions: {
                    ...story.answer_versions,
                    star: {
                      ...story.answer_versions?.star,
                      task: event.currentTarget.value,
                    },
                  },
                })}
            ></textarea>
          </FormField>
          <FormField label="STAR action">
            <textarea
              aria-label="STAR action"
              rows="2"
              value={story.answer_versions?.star?.action ?? ""}
              oninput={(event) =>
                updateStory(index, {
                  ...story,
                  answer_versions: {
                    ...story.answer_versions,
                    star: {
                      ...story.answer_versions?.star,
                      action: event.currentTarget.value,
                    },
                  },
                })}
            ></textarea>
          </FormField>
          <FormField label="STAR result">
            <textarea
              aria-label="STAR result"
              rows="2"
              value={story.answer_versions?.star?.result ?? ""}
              oninput={(event) =>
                updateStory(index, {
                  ...story,
                  answer_versions: {
                    ...story.answer_versions,
                    star: {
                      ...story.answer_versions?.star,
                      result: event.currentTarget.value,
                    },
                  },
                })}
            ></textarea>
          </FormField>
        </div>
      {/if}
    </section>
  {/each}
</div>
