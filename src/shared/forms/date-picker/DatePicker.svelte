<script lang="ts">
  import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
  import CheckIcon from "@lucide/svelte/icons/check";
  import SearchIcon from "@lucide/svelte/icons/search";
  import StarIcon from "@lucide/svelte/icons/star";
  import XIcon from "@lucide/svelte/icons/x";
  import {
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
  } from "@internationalized/date";
  import { parseDate } from "chrono-node";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Popover from "@stevejuma/ui/shadcn/popover";
  import TaskDueCalendar from "../task-due-calendar/TaskDueCalendar.svelte";
  import {
    buildNaturalDateSuggestions,
    calendarDateFromDate,
    calendarDateFromValue,
    dateOnlyFromCalendarDate,
    normalizeDateOnly,
    todayDateOnly,
    type DateSuggestion,
  } from "../core/date-utils";

  let {
    value = $bindable<string | undefined>(undefined),
    ariaLabel = "Choose date",
    placeholder = "Choose date",
    clearable = true,
    disabled = false,
    error = null,
    locale,
    onValueChange,
  }: {
    /** Selected date as `YYYY-MM-DD`. Bind it to keep the picker controlled. */
    value?: string | undefined;
    /** Labels the trigger when its displayed date is not sufficient context. */
    ariaLabel?: string;
    /** Shown in the trigger before a date has been selected. */
    placeholder?: string;
    /** When true, shows a Clear action in the popover. */
    clearable?: boolean;
    disabled?: boolean;
    /** Validation message shown under the trigger; also sets aria-invalid. */
    error?: string | null;
    /** Optional locale for the human-readable selected-date label. */
    locale?: string;
    onValueChange?: (value: string | undefined) => void;
  } = $props();

  let open = $state(false);
  let inputValue = $state("");
  let typedCalendar = $state<DateValue | undefined>(undefined);

  const uid = $props.id();
  const errorId = `${uid}-error`;

  const normalizedValue = $derived(normalizeDateOnly(value));
  const formatter = $derived(
    new DateFormatter(locale ?? undefined, { dateStyle: "medium" }),
  );
  const displayValue = $derived.by(() => {
    if (!normalizedValue) return placeholder;
    const calendar = calendarDateFromValue(normalizedValue);
    if (!calendar) return normalizedValue;
    return formatter.format(calendar.toDate(getLocalTimeZone()));
  });
  const naturalQuery = $derived(inputValue.trim());
  const naturalSuggestions = $derived.by(() =>
    buildNaturalDateSuggestions(naturalQuery, { locale }),
  );
  const isToday = $derived(normalizedValue === todayDateOnly());
  const selectedDate = $derived(
    naturalQuery
      ? (typedCalendar ?? calendarDateFromValue(value))
      : calendarDateFromValue(value),
  );

  function resetSearch() {
    inputValue = "";
    typedCalendar = undefined;
  }

  function setOpen(next: boolean) {
    open = next;
    if (!next) resetSearch();
  }

  function updateValue(next: string | undefined) {
    const normalized = normalizeDateOnly(next);
    value = normalized;
    onValueChange?.(normalized);
  }

  function selectDate(date: string) {
    updateValue(date);
    setOpen(false);
  }

  function clearDate() {
    updateValue(undefined);
    setOpen(false);
  }

  function updateNaturalDate(nextValue: string) {
    inputValue = nextValue;
    const parsed = parseDate(nextValue);
    typedCalendar = parsed ? calendarDateFromDate(parsed) : undefined;
  }

  function applySuggestion(suggestion: DateSuggestion) {
    selectDate(suggestion.date);
  }

  function applyToday() {
    selectDate(todayDateOnly());
  }
</script>

<div class="ui-date-picker" data-ui-component="date-picker">
  <Popover.Root {open} onOpenChange={setOpen}>
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="outline"
          class="ui-date-picker__trigger justify-start font-normal"
          aria-label={ariaLabel}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          {disabled}
        >
          <CalendarDaysIcon aria-hidden="true" />
          <span class:ui-date-picker__placeholder={!normalizedValue}
            >{displayValue}</span
          >
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content
      class="ui-date-picker__content"
      aria-label="Choose date"
      align="start"
    >
      <div class="ui-date-picker__panel">
        <div class="ui-date-picker__search">
          <SearchIcon aria-hidden="true" />
          <input
            aria-label="When"
            bind:value={inputValue}
            placeholder="When"
            oninput={(event) => {
              updateNaturalDate(event.currentTarget.value);
            }}
            onkeydown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                const [suggestion] = naturalSuggestions;
                if (suggestion) applySuggestion(suggestion);
              }
            }}
          />
          {#if inputValue}
            <button
              type="button"
              aria-label="Clear search"
              class="ui-date-picker__search-clear"
              onclick={() => resetSearch()}
            >
              <XIcon aria-hidden="true" />
            </button>
          {/if}
        </div>

        {#if naturalQuery}
          <div class="ui-date-picker__suggestions">
            {#each naturalSuggestions as suggestion (suggestion.id)}
              <button
                type="button"
                class="ui-date-picker__suggestion"
                onclick={() => applySuggestion(suggestion)}
              >
                <CalendarDaysIcon aria-hidden="true" />
                <span class="ui-date-picker__suggestion-label">
                  {suggestion.label}
                </span>
                <span class="ui-date-picker__suggestion-date">
                  {suggestion.dateLabel}
                </span>
              </button>
            {:else}
              <div class="ui-date-picker__suggestion-empty">
                No date suggestion
              </div>
            {/each}
          </div>
        {:else}
          <div class="ui-date-picker__quick">
            <button
              type="button"
              class="ui-date-picker__quick-row"
              onclick={() => applyToday()}
            >
              <span
                class="ui-date-picker__quick-icon ui-date-picker__quick-icon--star"
              >
                <StarIcon aria-hidden="true" />
              </span>
              <span>Today</span>
              {#if isToday}
                <CheckIcon
                  class="ui-date-picker__quick-check"
                  aria-hidden="true"
                />
              {/if}
            </button>
          </div>

          <div class="ui-date-picker__calendar">
            <TaskDueCalendar
              value={selectedDate}
              onValueChange={(nextValue) => {
                if (nextValue) {
                  selectDate(dateOnlyFromCalendarDate(nextValue));
                }
              }}
            />
          </div>

          {#if clearable}
            <div class="ui-date-picker__actions">
              <button
                type="button"
                class="ui-date-picker__clear"
                onclick={() => clearDate()}
              >
                Clear
              </button>
            </div>
          {/if}
        {/if}
      </div>
    </Popover.Content>
  </Popover.Root>

  {#if error}
    <p id={errorId} class="ui-date-picker__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .ui-date-picker {
    display: grid;
    gap: 0.35rem;
    width: fit-content;
    max-width: 100%;
  }

  .ui-date-picker__placeholder {
    color: var(--ui-form-muted);
  }

  :global(.ui-date-picker__content) {
    width: auto;
    min-width: 15rem;
    padding: 0;
    border: 1px solid var(--ui-form-border);
    border-radius: var(--ui-form-radius);
    background: var(--ui-form-popover, var(--ui-form-background));
    color: var(--ui-form-foreground);
    box-shadow: var(--ui-form-shadow);
  }

  .ui-date-picker__panel {
    display: grid;
    gap: 0.45rem;
    min-width: 15rem;
    padding: 0.55rem;
  }

  .ui-date-picker__search {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid var(--ui-form-border);
    border-radius: calc(var(--ui-form-radius) * 0.55);
    padding: 0.25rem 0.45rem;
  }

  .ui-date-picker__search :global(svg) {
    width: 0.9rem;
    height: 0.9rem;
    color: var(--ui-form-muted);
  }

  .ui-date-picker__search input {
    width: 100%;
    min-width: 0;
    border: 0;
    background: transparent;
    color: var(--ui-form-foreground);
    font: inherit;
    font-size: 0.85rem;
    padding: 0.2rem 0;
  }

  .ui-date-picker__search input:focus {
    outline: 0;
  }

  .ui-date-picker__search-clear {
    display: inline-grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: var(--ui-form-muted);
    cursor: pointer;
    padding: 0;
  }

  .ui-date-picker__search-clear :global(svg) {
    width: 0.85rem;
    height: 0.85rem;
  }

  .ui-date-picker__suggestions,
  .ui-date-picker__quick {
    display: grid;
    gap: 0.1rem;
  }

  .ui-date-picker__suggestion,
  .ui-date-picker__quick-row {
    display: grid;
    grid-template-columns: 1.1rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.45rem;
    width: 100%;
    min-height: 1.75rem;
    border: 0;
    border-radius: calc(var(--ui-form-radius) * 0.45);
    background: transparent;
    color: var(--ui-form-foreground);
    cursor: pointer;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 650;
    padding: 0.2rem 0.35rem;
    text-align: left;
  }

  .ui-date-picker__suggestion:hover,
  .ui-date-picker__suggestion:focus-visible,
  .ui-date-picker__quick-row:hover,
  .ui-date-picker__quick-row:focus-visible {
    background: color-mix(in srgb, var(--ui-form-border) 45%, transparent);
    outline: 0;
  }

  .ui-date-picker__suggestion :global(svg),
  .ui-date-picker__quick-icon :global(svg),
  .ui-date-picker__quick-row :global(.ui-date-picker__quick-check) {
    width: 0.95rem;
    height: 0.95rem;
  }

  .ui-date-picker__suggestion :global(svg),
  .ui-date-picker__quick-icon {
    color: var(--ui-form-muted);
  }

  .ui-date-picker__quick-icon--star {
    color: #f8c400;
  }

  .ui-date-picker__quick-row :global(.ui-date-picker__quick-check) {
    color: var(--ui-form-accent);
  }

  .ui-date-picker__suggestion-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ui-date-picker__suggestion-date,
  .ui-date-picker__suggestion-empty {
    color: var(--ui-form-muted);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .ui-date-picker__suggestion-empty {
    padding: 0.35rem 0.45rem;
  }

  .ui-date-picker__calendar {
    overflow: hidden;
    border: 1px solid var(--ui-form-border);
    border-radius: calc(var(--ui-form-radius) * 0.55);
  }

  .ui-date-picker__actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.15rem;
  }

  .ui-date-picker__clear {
    border: 0;
    border-radius: calc(var(--ui-form-radius) * 0.45);
    background: transparent;
    color: var(--ui-form-muted);
    cursor: pointer;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 650;
    padding: 0.25rem 0.45rem;
  }

  .ui-date-picker__clear:hover,
  .ui-date-picker__clear:focus-visible {
    color: var(--ui-form-foreground);
    outline: 0;
  }

  .ui-date-picker__error {
    margin: 0;
    color: var(--destructive, #dc2626);
    font-size: 0.75rem;
    line-height: 1.25;
  }
</style>
