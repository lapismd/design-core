<script lang="ts">
  import { untrack } from "svelte";

  import AddSectionChooser from "../add-section-chooser/AddSectionChooser.svelte";
  import EntryActions from "../entry-actions/EntryActions.svelte";
  import FormAddButton from "../form-add-button/FormAddButton.svelte";
  import FormSectionHeader from "../form-section-header/FormSectionHeader.svelte";
  import StructuredForm from "../structured-form/StructuredForm.svelte";
  import {
    entryConfigs,
    extraDetailConfig,
    profileConfig,
    roleHistoryConfig,
    socialNetworkConfig,
    targetRolesConfig,
  } from "./complete-cv-form.config";
  import {
    ENTRY_TYPE_OPTIONS,
    addEntryLabel,
    appendUiId,
    createUiIdentityState,
    defaultEntry,
    defaultSection,
    entryTitle,
    isRecord,
    moveItem,
    removeItem,
    setAtPath,
    simpleListEntryMarker,
    uniqueId,
  } from "./complete-cv-form.model";
  import type {
    CompleteCvSource,
    CvEntry,
    CvEntryType,
    CvFragment,
    CvSection,
    StoryRecord,
    UiIdentityState,
  } from "./complete-cv-form.types";

  let {
    cv,
    closedIds,
    identityRevision,
    onChange,
    onClosedIdsChange,
  }: {
    cv: CvFragment;
    closedIds: string[];
    identityRevision: number;
    onChange: (cv: CvFragment) => void;
    onClosedIdsChange: (ids: string[]) => void;
  } = $props();

  function identitiesFor(value: CvFragment): UiIdentityState {
    const identities = createUiIdentityState({ cv: value } as CompleteCvSource);
    for (const [sectionIndex, section] of (value.sections ?? []).entries()) {
      const sectionUiId = identities.sections[sectionIndex];
      for (const [entryIndex, entry] of section.entries.entries()) {
        if (!isRecord(entry)) continue;
        const entryUiId = identities.entries[sectionUiId]?.[entryIndex];
        if (!entryUiId) continue;
        for (const key of ["role_history", "extra_details"] as const) {
          const items = Array.isArray(entry[key]) ? entry[key] : [];
          identities.nested[`${entryUiId}:${key}`] = Array.from(
            { length: items.length },
            (_, index) => `${entryUiId}-${key}-${index + 1}`,
          );
        }
      }
    }
    return identities;
  }

  let identities = $state(untrack(() => identitiesFor(cv)));
  let lastIdentityRevision = $state(untrack(() => identityRevision));
  let addSectionOpen = $state(false);
  let addSectionTitle = $state("New Section");

  $effect(() => {
    if (identityRevision !== lastIdentityRevision) {
      identities = identitiesFor(untrack(() => cv));
      lastIdentityRevision = identityRevision;
    }
  });

  function open(id: string): boolean {
    return !closedIds.includes("*") && !closedIds.includes(id);
  }

  function toggle(id: string): void {
    const withoutAll = closedIds.filter((item) => item !== "*");
    onClosedIdsChange(
      open(id) ? [...withoutAll, id] : withoutAll.filter((item) => item !== id),
    );
  }

  function update(path: Array<string | number>, value: unknown): void {
    onChange(setAtPath(cv, path, value));
  }

  function moveSection(index: number, direction: -1 | 1): void {
    update(["sections"], moveItem(cv.sections ?? [], index, direction));
    identities.sections = moveItem(identities.sections, index, direction);
  }

  function removeSection(index: number): void {
    const sectionUiId = identities.sections[index];
    update(["sections"], removeItem(cv.sections ?? [], index));
    identities.sections = removeItem(identities.sections, index);
    delete identities.entries[sectionUiId];
  }

  function addSection(entryType: string): void {
    const sections = cv.sections ?? [];
    const section = defaultSection(
      entryType as CvEntryType,
      sections.map((item) => item.id),
      addSectionTitle,
    );
    const sectionUiId = uniqueId(`section-${section.id}`, identities.sections);
    update(["sections"], [...sections, section]);
    identities.sections = [...identities.sections, sectionUiId];
    identities.entries[sectionUiId] = [`${sectionUiId}-entry-1`];
    addSectionOpen = false;
    addSectionTitle = "New Section";
  }

  function moveEntry(
    sectionIndex: number,
    entryIndex: number,
    direction: -1 | 1,
  ): void {
    const section = (cv.sections ?? [])[sectionIndex];
    if (!section) return;
    update(
      ["sections", sectionIndex, "entries"],
      moveItem(section.entries, entryIndex, direction),
    );
    const sectionUiId = identities.sections[sectionIndex];
    identities.entries[sectionUiId] = moveItem(
      identities.entries[sectionUiId] ?? [],
      entryIndex,
      direction,
    );
  }

  function removeEntry(sectionIndex: number, entryIndex: number): void {
    const section = (cv.sections ?? [])[sectionIndex];
    if (!section) return;
    update(
      ["sections", sectionIndex, "entries"],
      removeItem(section.entries, entryIndex),
    );
    const sectionUiId = identities.sections[sectionIndex];
    identities.entries[sectionUiId] = removeItem(
      identities.entries[sectionUiId] ?? [],
      entryIndex,
    );
  }

  function addEntry(sectionIndex: number): void {
    const section = (cv.sections ?? [])[sectionIndex];
    if (!section) return;
    update(
      ["sections", sectionIndex, "entries"],
      [...section.entries, defaultEntry(section.entry_type)],
    );
    const sectionUiId = identities.sections[sectionIndex];
    identities.entries[sectionUiId] = appendUiId(
      identities.entries[sectionUiId] ?? [],
      `${sectionUiId}-entry`,
    );
  }

  function updateEntry(
    sectionIndex: number,
    entryIndex: number,
    entryType: CvEntryType,
    value: StoryRecord,
  ): void {
    update(
      ["sections", sectionIndex, "entries", entryIndex],
      entryType === "TextEntry" ? String(value.text ?? "") : value,
    );
  }

  function nestedIds(entryUiId: string, key: string): string[] {
    return identities.nested[`${entryUiId}:${key}`] ?? [];
  }

  function setNestedIds(entryUiId: string, key: string, ids: string[]): void {
    identities.nested[`${entryUiId}:${key}`] = ids;
  }

  function nestedItems(entry: CvEntry, key: string): StoryRecord[] {
    if (!isRecord(entry) || !Array.isArray(entry[key])) return [];
    return (entry[key] as unknown[]).filter(isRecord);
  }

  function updateNested(
    sectionIndex: number,
    entryIndex: number,
    key: string,
    items: StoryRecord[],
  ): void {
    update(["sections", sectionIndex, "entries", entryIndex, key], items);
  }

  function addNested(
    sectionIndex: number,
    entryIndex: number,
    entryUiId: string,
    key: "role_history" | "extra_details",
  ): void {
    const entry = (cv.sections ?? [])[sectionIndex]?.entries[entryIndex];
    const items = nestedItems(entry, key);
    const value =
      key === "role_history"
        ? { position: "Role", start_date: "", end_date: "", display_date: "" }
        : {
            id: "detail",
            title: "Extra detail",
            content_type: "list",
            enabled: true,
            items: [""],
          };
    updateNested(sectionIndex, entryIndex, key, [...items, value]);
    setNestedIds(
      entryUiId,
      key,
      appendUiId(nestedIds(entryUiId, key), `${entryUiId}-${key}`),
    );
  }
</script>

<div class="complete-cv-content" data-testid="complete-cv-structured">
  {#if open("cv-profile")}
    <section class="complete-cv-profile">
      <StructuredForm
        value={cv}
        config={profileConfig}
        onChange={(next) => onChange(next as CvFragment)}
      />

      <div class="complete-cv-subgroup" data-testid="social-networks">
        <div class="complete-cv-subgroup-title-row">
          <p class="complete-cv-subgroup-title">Social Networks</p>
          <FormAddButton
            label="Add"
            onclick={() => {
              update(
                ["social_networks"],
                [
                  ...(cv.social_networks ?? []),
                  { network: "LinkedIn", username: "" },
                ],
              );
              identities.socialNetworks = appendUiId(
                identities.socialNetworks,
                "social",
              );
            }}
          />
        </div>
        {#each cv.social_networks ?? [] as network, index (identities.socialNetworks[index])}
          <EntryActions
            {index}
            total={cv.social_networks?.length ?? 0}
            removeLabel={`Remove social network ${index + 1}`}
            onMove={(direction) => {
              update(
                ["social_networks"],
                moveItem(cv.social_networks ?? [], index, direction),
              );
              identities.socialNetworks = moveItem(
                identities.socialNetworks,
                index,
                direction,
              );
            }}
            onRemove={() => {
              update(
                ["social_networks"],
                removeItem(cv.social_networks ?? [], index),
              );
              identities.socialNetworks = removeItem(
                identities.socialNetworks,
                index,
              );
            }}
          >
            <StructuredForm
              value={network}
              config={socialNetworkConfig}
              onChange={(next) => update(["social_networks", index], next)}
            />
          </EntryActions>
        {/each}
      </div>

      <StructuredForm
        value={cv}
        config={targetRolesConfig}
        onChange={(next) => onChange(next as CvFragment)}
      />
    </section>
  {/if}

  {#each cv.sections ?? [] as section, sectionIndex (identities.sections[sectionIndex])}
    {@const sectionUiId = identities.sections[sectionIndex]}
    <section
      class="complete-cv-section"
      data-entry-type={section.entry_type}
      data-testid={`cv-section-${section.entry_type}`}
    >
      <FormSectionHeader
        title={section.title}
        disclosureTitle={`${section.title} ${section.entry_type}`}
        index={sectionIndex}
        total={cv.sections?.length ?? 0}
        open={open(sectionUiId)}
        onTitleChange={(title) =>
          update(["sections", sectionIndex, "title"], title)}
        onMove={(direction) => moveSection(sectionIndex, direction)}
        onRemove={() => removeSection(sectionIndex)}
        onToggle={() => toggle(sectionUiId)}
      />

      {#if open(sectionUiId)}
        <div class="complete-cv-section__body">
          {#each section.entries as entry, entryIndex (identities.entries[sectionUiId]?.[entryIndex])}
            {@const entryUiId =
              identities.entries[sectionUiId]?.[entryIndex] ??
              `${sectionUiId}-${entryIndex}`}
            {@const complex = [
              "ExperienceEntry",
              "EducationEntry",
              "PublicationEntry",
              "NormalEntry",
            ].includes(section.entry_type)}
            {@const entryRecord = isRecord(entry) ? entry : { text: entry }}
            {#if complex}
              <article
                class="complete-cv-entry"
                data-testid={`entry-${section.entry_type}-${entryIndex}`}
              >
                <FormSectionHeader
                  title={entryTitle(section.entry_type, entry, entryIndex)}
                  index={entryIndex}
                  total={section.entries.length}
                  open={open(entryUiId)}
                  editable={false}
                  titleToggleable
                  titleRowClass="complete-cv-entry-title-row"
                  removeLabel={`Remove ${entryTitle(section.entry_type, entry, entryIndex)}`}
                  onMove={(direction) =>
                    moveEntry(sectionIndex, entryIndex, direction)}
                  onRemove={() => removeEntry(sectionIndex, entryIndex)}
                  onToggle={() => toggle(entryUiId)}
                />
                {#if open(entryUiId)}
                  <div class="complete-cv-entry__body">
                    <StructuredForm
                      value={entryRecord}
                      config={entryConfigs[section.entry_type]}
                      onChange={(next) =>
                        updateEntry(
                          sectionIndex,
                          entryIndex,
                          section.entry_type,
                          next as StoryRecord,
                        )}
                    />

                    {#if section.entry_type === "ExperienceEntry"}
                      {#each ["role_history", "extra_details"] as nestedKeyName}
                        <div
                          class="complete-cv-subgroup"
                          data-testid={`${nestedKeyName}-${entryIndex}`}
                        >
                          <p class="complete-cv-subgroup-title">
                            {nestedKeyName === "role_history"
                              ? "Role history"
                              : "Extra details"}
                          </p>
                          {#each nestedItems(entry, nestedKeyName) as nested, nestedIndex (nestedIds(entryUiId, nestedKeyName)[nestedIndex])}
                            {@const nestedUiId =
                              nestedIds(entryUiId, nestedKeyName)[
                                nestedIndex
                              ] ??
                              `${entryUiId}-${nestedKeyName}-${nestedIndex}`}
                            <div class="complete-cv-nested-entry">
                              <FormSectionHeader
                                title={String(
                                  nested.position ??
                                    nested.title ??
                                    `${nestedKeyName === "role_history" ? "Role" : "Detail"} ${nestedIndex + 1}`,
                                )}
                                index={nestedIndex}
                                total={nestedItems(entry, nestedKeyName).length}
                                open={open(nestedUiId)}
                                editable={false}
                                titleToggleable
                                titleRowClass="complete-cv-nested-title-row"
                                onMove={(direction) => {
                                  updateNested(
                                    sectionIndex,
                                    entryIndex,
                                    nestedKeyName,
                                    moveItem(
                                      nestedItems(entry, nestedKeyName),
                                      nestedIndex,
                                      direction,
                                    ),
                                  );
                                  setNestedIds(
                                    entryUiId,
                                    nestedKeyName,
                                    moveItem(
                                      nestedIds(entryUiId, nestedKeyName),
                                      nestedIndex,
                                      direction,
                                    ),
                                  );
                                }}
                                onRemove={() => {
                                  updateNested(
                                    sectionIndex,
                                    entryIndex,
                                    nestedKeyName,
                                    removeItem(
                                      nestedItems(entry, nestedKeyName),
                                      nestedIndex,
                                    ),
                                  );
                                  setNestedIds(
                                    entryUiId,
                                    nestedKeyName,
                                    removeItem(
                                      nestedIds(entryUiId, nestedKeyName),
                                      nestedIndex,
                                    ),
                                  );
                                }}
                                onToggle={() => toggle(nestedUiId)}
                              />
                              {#if open(nestedUiId)}
                                <div class="complete-cv-entry__body">
                                  <StructuredForm
                                    value={nested}
                                    config={nestedKeyName === "role_history"
                                      ? roleHistoryConfig
                                      : extraDetailConfig}
                                    onChange={(next) =>
                                      updateNested(
                                        sectionIndex,
                                        entryIndex,
                                        nestedKeyName,
                                        nestedItems(entry, nestedKeyName).map(
                                          (item, index) =>
                                            index === nestedIndex
                                              ? (next as StoryRecord)
                                              : item,
                                        ),
                                      )}
                                  />
                                </div>
                              {/if}
                            </div>
                          {/each}
                          <FormAddButton
                            label={nestedKeyName === "role_history"
                              ? "Add role history"
                              : "Add extra detail"}
                            onclick={() =>
                              addNested(
                                sectionIndex,
                                entryIndex,
                                entryUiId,
                                nestedKeyName as
                                  | "role_history"
                                  | "extra_details",
                              )}
                          />
                        </div>
                      {/each}
                    {/if}
                  </div>
                {/if}
              </article>
            {:else}
              {@const marker = simpleListEntryMarker(
                section.entry_type,
                entryIndex,
                section.entries.length,
              )}
              {@const unlabeled = [
                "TextEntry",
                "BulletEntry",
                "NumberedEntry",
                "ReversedNumberedEntry",
              ].includes(section.entry_type)}
              <EntryActions
                index={entryIndex}
                total={section.entries.length}
                removeLabel={`Remove ${entryTitle(section.entry_type, entry, entryIndex)}`}
                onMove={(direction) =>
                  moveEntry(sectionIndex, entryIndex, direction)}
                onRemove={() => removeEntry(sectionIndex, entryIndex)}
              >
                <div
                  class:complete-cv-simple-entry={marker !== null}
                  class:complete-cv-unlabeled-entry={unlabeled}
                >
                  {#if marker !== null}
                    <span
                      class="complete-cv-simple-entry__marker"
                      data-testid="simple-entry-marker"
                      aria-hidden="true">{marker}</span
                    >
                  {/if}
                  <StructuredForm
                    value={entryRecord}
                    config={entryConfigs[section.entry_type]}
                    onChange={(next) =>
                      updateEntry(
                        sectionIndex,
                        entryIndex,
                        section.entry_type,
                        next as StoryRecord,
                      )}
                  />
                </div>
              </EntryActions>
            {/if}
          {/each}
          <FormAddButton
            label={`Add ${addEntryLabel(section.entry_type)}`}
            onclick={() => addEntry(sectionIndex)}
          />
        </div>
      {/if}
    </section>
  {/each}

  <AddSectionChooser
    open={addSectionOpen}
    title={addSectionTitle}
    options={ENTRY_TYPE_OPTIONS.map(({ value, label }) => ({ value, label }))}
    onOpen={() => (addSectionOpen = true)}
    onCancel={() => {
      addSectionOpen = false;
      addSectionTitle = "New Section";
    }}
    onTitleChange={(title) => (addSectionTitle = title)}
    onChoose={addSection}
  />
</div>
