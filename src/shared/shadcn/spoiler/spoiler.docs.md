# Spoiler

Import `{ Spoiler }` from `@lapismd/design-core/shadcn/spoiler`.

Supply noninteractive inline content, an optional label and bindable revealed state. Enter/Space reveal or conceal; disabled blocks changes. Concealed text remains in the document but is hidden visually and from assistive technology, so this is not a security boundary. Particles respect reduced motion and release observers and animation frames on disposal.

## Tokens

The family imports its native CSS. Override --ui-spoiler-radius (.3rem), --ui-spoiler-background (transparent). Colours follow semantic
host tokens and overlays use the existing portal context.

## Usage

See the colocated Spoiler.example-sources.ts for consumer-usable source.
Source attribution is in PROVENANCE.md.

For Markdown, import spoilerExtension from @lapismd/design-core/chat and pass it
to MarkdownContent extensions. It recognizes paired inline ||delimiters|| after
Mira parsing, excluding code blocks and inline code. Source strings are unchanged.
