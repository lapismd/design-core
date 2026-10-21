# Relative Time

Import `{ RelativeTime }` from `@lapismd/design-core/shadcn/relative-time`.

Timestamp accepts an ISO string, Date or epoch milliseconds. Supply now in milliseconds for deterministic rendering, locale for formatting and absoluteAfterDays (30 by default). Exact-date details are available on keyboard focus through Tooltip; invalid dates show Unknown date. Live mode updates every 30 seconds and releases its timer on disposal.

## Tokens

The family imports its native CSS. Override --ui-relative-time-font-size (inherited). Colours follow semantic
host tokens and overlays use the existing portal context.

## Usage

See the colocated RelativeTime.example-sources.ts for consumer-usable source.
Source attribution is in PROVENANCE.md.
