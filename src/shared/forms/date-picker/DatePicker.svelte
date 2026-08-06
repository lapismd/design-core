<script lang="ts">
  import "./DatePicker.css";
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
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as Popover from "@lapismd/design-core/shadcn/popover";
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
    new DateFormatter(locale ?? "en-US", { dateStyle: "medium" }),
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
          class="ui-date-picker__trigger"
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
