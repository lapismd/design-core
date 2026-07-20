# Tasks page spec

Tasks is an overview with segmented ownership/status views: **For me**,
**Others**, **Upcoming**, and **Done**. It has a page title, a filter/sort
control, and a new-task affordance. Segments are an exclusive selection; use
the installed `ToggleGroup` when implemented rather than bespoke buttons.

Changing segment preserves search/filter state where possible and resets only
the main list scroll. The empty result should identify the active segment and
offer a clear next action.
