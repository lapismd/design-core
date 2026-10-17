# Link Preview

Import `{ LinkPreview }` from `@lapismd/design-core/shadcn/link-preview`.

Supply href, title, description, site, optional image/icon and inline, compact or rich layout. The host owns metadata, site classification and image authorization. The component never fetches preview metadata. Unsupported protocols stay readable and noninteractive; safe links open with noopener/noreferrer by default.

## Tokens

The family imports its native CSS. Override --ui-link-preview-padding (.5rem .75rem), --ui-link-preview-radius (.65rem), --ui-link-preview-font-size (.875rem), --ui-link-preview-rich-width (26rem), --ui-link-preview-image-height (6rem), --ui-link-preview-image-background (muted). Colours follow semantic
host tokens and overlays use the existing portal context.

## Usage

See the colocated LinkPreview.example-sources.ts for consumer-usable source.
Source attribution is in PROVENANCE.md.
