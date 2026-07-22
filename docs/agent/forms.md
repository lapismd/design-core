---
id: forms
title: Forms guidance
summary: Structured forms vs shadcn controls; link to UI Forms/Guidance and FORMS.md.
sources:
  - FORMS.md
  - src/shared/forms/Guidance.mdx
  - COMPONENT_AUDIT.md
  - AGENTS.md
---

# Forms guidance

Use `@stevejuma/ui/forms` for structured editing and CV form-row chrome. Use
shadcn for generic controls (`Select`, `Switch`, `Command`, `Input`, …).

This topic summarizes the package contract. Full decision guide:

- Package: `FORMS.md`
- Storybook: `UI Forms/Guidance`

## Choose the right layer

1. **StructuredForm** — schema-shaped data with typed field configs from
   `createFormConfig` / `textField` / `segmentedField` / etc.
2. **Composed primitives** — `FormField`, `FormSectionHeader`,
   `CollapsibleItemList`, `InlineOptionPicker` for one-off layouts.
3. **YamlBackedForm** — dual structured + YAML source mode over the same draft.
4. **JsonBackedForm** — dual structured + JSON source mode (prefer YAML for new
   user-authored config).
5. **PatchableForm** — YamlBackedForm + JSON Patch Keep/Undo (`createOrAppendJsonReview`,
   `reviewedTextField` / `reviewedStringListField`, YAML `toYamlDiffs`).
6. **shadcn** — Select, Switch, Command/Popover pickers, Toggle Group, Field.
   Prefer shared `FilterCommandPicker` / `DatePicker` when the forms catalog
   already covers the control.
7. **filter** — search chrome and filter-query language via `@stevejuma/ui/filter`
   (`SearchFilterBar`). Compose from forms; see `Filter/Guidance` and
   **UI Forms/Form Inputs/Search Filter in a Form**.

## Shared form pattern

- Labels on the left, values on the right, visible row separators
- One `max-content minmax(0, 1fr)` label/value grid per form scope
  (`cv-structured-form` / `ui-structured-form`)
- Proper-case labels; debounced autosave unless a workflow defers writes
- Dotted outlines only via `FormPlaceholder` in stories — never on real package
  components

## Tokens

Forms use `--ui-form-*` (`formTokenNames` / `@stevejuma/ui/forms/tokens`),
defaults in `form.tokens.css`. Same override idea as shadcn `--ui-<family>-*`
maps.

## Before adding a form export

Classify in `COMPONENT_AUDIT.md` as shared primitive, app-specific, or deferred.
Link reusable form primitives back to `UI Forms/Guidance` in Storybook docs.
