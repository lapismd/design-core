<script lang="ts">
  import PlusIcon from "@lucide/svelte/icons/plus";
  import {
    AddSectionChooser,
    EntryActions,
    FormField,
    FormSectionHeader,
    ListEditor,
    SortableArrayItem,
    StructuredForm,
    createFormConfig,
    textField,
  } from "@stevejuma/ui/forms";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Accordion from "@stevejuma/ui/shadcn/accordion";
  import {
    ENTRY_TYPE_OPTIONS,
    addEntryLabel,
    defaultEntry,
    defaultSection,
    entryTitle,
    isSimpleListEntryType,
    moveItem,
    setSimpleListValue,
    simpleListValue,
  } from "../cv-sections";
  import GenericEntryEditor from "../editors/GenericEntryEditor.svelte";
  import SocialNetworksEditor from "../social-networks-editor/SocialNetworksEditor.svelte";
  import type { CvDocument, CvEntry, CvEntryType, CvSection } from "../types";

  let {
    value,
    collapseAll = false,
    onChange,
  }: {
    value: CvDocument;
    collapseAll?: boolean;
    onChange: (value: CvDocument) => void;
  } = $props();

  let sectionOpen = $state<Record<string, boolean>>({});
  let addSectionOpen = $state(false);
  let addSectionTitle = $state("");
  let draggingIndex = $state<number | null>(null);
  let draggingSectionId = $state<string | null>(null);

  const profileConfig = createFormConfig<CvDocument>({
    id: "cv-profile",
    fields: [
      textField({
        id: "name",
        label: "Name",
        get: (p) => p.name,
        set: (p, name) => ({ ...p, name }),
      }),
      textField({
        id: "headline",
        label: "Headline",
        get: (p) => p.headline,
        set: (p, headline) => ({ ...p, headline }),
      }),
      textField({
        id: "location",
        label: "Location",
        get: (p) => p.location,
        set: (p, location) => ({ ...p, location }),
      }),
      textField({
        id: "email",
        label: "Email",
        inputType: "email",
        get: (p) => p.email,
        set: (p, email) => ({ ...p, email }),
      }),
      textField({
        id: "phone",
        label: "Phone",
        get: (p) => p.phone,
        set: (p, phone) => ({ ...p, phone }),
      }),
      textField({
        id: "website",
        label: "Website",
        get: (p) => p.website ?? "",
        set: (p, website) => ({ ...p, website }),
      }),
    ],
  });

  const sectionChooserOptions = ENTRY_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  function isOpen(sectionId: string) {
    if (collapseAll) return false;
    return sectionOpen[sectionId] ?? true;
  }

  function patch(partial: Partial<CvDocument>) {
    onChange({ ...value, ...partial });
  }

  function updateSection(index: number, section: CvSection) {
    const sections = [...value.sections];
    sections[index] = section;
    patch({ sections });
  }

  function updateEntry(
    sectionIndex: number,
    entryIndex: number,
    entry: CvEntry,
  ) {
    const section = value.sections[sectionIndex];
    const entries = [...section.entries];
    entries[entryIndex] = entry;
    updateSection(sectionIndex, { ...section, entries });
  }

  function addEntry(sectionIndex: number) {
    const section = value.sections[sectionIndex];
    updateSection(sectionIndex, {
      ...section,
      entries: [...section.entries, defaultEntry(section.entry_type)],
    });
  }

  function removeEntry(sectionIndex: number, entryIndex: number) {
    const section = value.sections[sectionIndex];
    updateSection(sectionIndex, {
      ...section,
      entries: section.entries.filter((_, i) => i !== entryIndex),
    });
  }

  function moveEntry(
    sectionIndex: number,
    entryIndex: number,
    direction: -1 | 1,
  ) {
    const section = value.sections[sectionIndex];
    updateSection(sectionIndex, {
      ...section,
      entries: moveItem(section.entries, entryIndex, direction),
    });
  }

  function moveSection(index: number, direction: -1 | 1) {
    patch({ sections: moveItem(value.sections, index, direction) });
  }

  function removeSection(index: number) {
    patch({ sections: value.sections.filter((_, i) => i !== index) });
  }

  function chooseSection(entryType: string) {
    const typed = entryType as CvEntryType;
    const section = defaultSection(
      typed,
      value.sections.map((item) => item.id),
    );
    if (addSectionTitle.trim()) section.title = addSectionTitle.trim();
    patch({ sections: [...value.sections, section] });
    addSectionOpen = false;
    addSectionTitle = "";
  }

  function arrayMove<T>(values: T[], from: number, to: number): T[] {
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }

  function startSimpleDrag(
    event: PointerEvent,
    sectionId: string,
    index: number,
  ) {
    if (event.button !== 0) return;
    event.preventDefault();
    draggingSectionId = sectionId;
    draggingIndex = index;
    window.addEventListener("pointermove", handleSimplePointerMove);
    window.addEventListener("pointerup", finishSimpleDrag, { once: true });
  }

  function handleSimplePointerMove(event: PointerEvent) {
    if (draggingIndex === null || !draggingSectionId) return;
    const sectionIndex = value.sections.findIndex(
      (section) => section.id === draggingSectionId,
    );
    if (sectionIndex < 0) return;
    const section = value.sections[sectionIndex];
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const item = element?.closest("[data-sortable-item]") as HTMLElement | null;
    const targetIndex = Number(item?.dataset.sortableIndex);
    if (
      !Number.isInteger(targetIndex) ||
      targetIndex < 0 ||
      targetIndex >= section.entries.length ||
      targetIndex === draggingIndex
    )
      return;
    updateSection(sectionIndex, {
      ...section,
      entries: arrayMove(section.entries, draggingIndex, targetIndex),
    });
    draggingIndex = targetIndex;
  }

  function finishSimpleDrag() {
    draggingIndex = null;
    draggingSectionId = null;
    window.removeEventListener("pointermove", handleSimplePointerMove);
  }
</script>

<div class="flex flex-col gap-6" data-ui-part="cv-sections-form">
  <StructuredForm
    {value}
    config={profileConfig}
    onChange={(next) => onChange(next as CvDocument)}
  />

  <SocialNetworksEditor
    items={value.social_networks ?? []}
    onChange={(social_networks) => patch({ social_networks })}
  />

  <ListEditor
    label="Target Roles"
    items={value.target_roles ?? []}
    addLabel="role"
    onChange={(target_roles) => patch({ target_roles })}
  />

  {#each value.sections as section, sectionIndex (section.id)}
    {@const open = isOpen(section.id)}
    <section class="flex flex-col gap-3">
      <FormSectionHeader
        title={section.title}
        index={sectionIndex}
        total={value.sections.length}
        titleToggleable
        editable={true}
        {open}
        onTitleChange={(title) =>
          updateSection(sectionIndex, { ...section, title })}
        onToggle={() => {
          sectionOpen = { ...sectionOpen, [section.id]: !open };
        }}
        onMove={(direction) => moveSection(sectionIndex, direction)}
        onRemove={() => removeSection(sectionIndex)}
      />

      {#if open}
        {#if section.entry_type === "TextEntry"}
          {#each section.entries as entry, entryIndex (entryIndex)}
            <EntryActions
              index={entryIndex}
              total={section.entries.length}
              onMove={(direction) =>
                moveEntry(sectionIndex, entryIndex, direction)}
              onRemove={() => removeEntry(sectionIndex, entryIndex)}
            >
              <GenericEntryEditor
                entryType="TextEntry"
                {entry}
                onUpdate={(next) => updateEntry(sectionIndex, entryIndex, next)}
              />
            </EntryActions>
          {/each}
        {:else if section.entry_type === "OneLineEntry"}
          {#each section.entries as entry, entryIndex (entryIndex)}
            <EntryActions
              index={entryIndex}
              total={section.entries.length}
              onMove={(direction) =>
                moveEntry(sectionIndex, entryIndex, direction)}
              onRemove={() => removeEntry(sectionIndex, entryIndex)}
            >
              <GenericEntryEditor
                entryType="OneLineEntry"
                {entry}
                onUpdate={(next) => updateEntry(sectionIndex, entryIndex, next)}
              />
            </EntryActions>
          {/each}
        {:else if isSimpleListEntryType(section.entry_type)}
          <div class="flex flex-col">
            {#each section.entries as entry, entryIndex (`${section.id}-${entryIndex}`)}
              <SortableArrayItem
                id={`${section.id}-${entryIndex}`}
                index={entryIndex}
                dragging={draggingSectionId === section.id &&
                  draggingIndex === entryIndex}
                onDragStart={(event, index) =>
                  startSimpleDrag(event, section.id, index)}
                onRemove={() => removeEntry(sectionIndex, entryIndex)}
              >
                <FormField
                  label={entryTitle(section.entry_type, entry, entryIndex)}
                >
                  <input
                    aria-label={entryTitle(
                      section.entry_type,
                      entry,
                      entryIndex,
                    )}
                    value={simpleListValue(section.entry_type, entry)}
                    oninput={(event) =>
                      updateEntry(
                        sectionIndex,
                        entryIndex,
                        setSimpleListValue(
                          section.entry_type,
                          event.currentTarget.value,
                        ),
                      )}
                  />
                </FormField>
              </SortableArrayItem>
            {/each}
          </div>
        {:else}
          <Accordion.Root
            type="single"
            class="w-full"
            value={`${section.id}-0`}
          >
            {#each section.entries as entry, entryIndex (entryIndex)}
              <Accordion.Item value={`${section.id}-${entryIndex}`}>
                <Accordion.Trigger>
                  {entryTitle(section.entry_type, entry, entryIndex)}
                </Accordion.Trigger>
                <Accordion.Content>
                  <EntryActions
                    index={entryIndex}
                    total={section.entries.length}
                    onMove={(direction) =>
                      moveEntry(sectionIndex, entryIndex, direction)}
                    onRemove={() => removeEntry(sectionIndex, entryIndex)}
                  >
                    <GenericEntryEditor
                      entryType={section.entry_type}
                      {entry}
                      onUpdate={(next) =>
                        updateEntry(sectionIndex, entryIndex, next)}
                    />
                  </EntryActions>
                </Accordion.Content>
              </Accordion.Item>
            {/each}
          </Accordion.Root>
        {/if}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="text-muted-foreground hover:text-foreground w-fit"
          onclick={() => addEntry(sectionIndex)}
        >
          <PlusIcon />
          Add {addEntryLabel(section.entry_type)}
        </Button>
      {/if}
    </section>
  {/each}

  <AddSectionChooser
    open={addSectionOpen}
    title={addSectionTitle}
    options={sectionChooserOptions}
    onOpen={() => {
      addSectionOpen = true;
    }}
    onCancel={() => {
      addSectionOpen = false;
      addSectionTitle = "";
    }}
    onTitleChange={(next) => {
      addSectionTitle = next;
    }}
    onChoose={chooseSection}
  />
</div>
