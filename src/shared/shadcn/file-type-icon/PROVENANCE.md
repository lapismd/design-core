# File Type Icon provenance

Project-authored Svelte adapter inspired by Changeyard's
`packages/web-ui/src/file-type-icon.tsx`. No React code or Changeyard CSS is
shipped. A pinned development-only dependency supplies the original coloured artwork.

Extracted artwork and matching data: `material-file-icons` 2.4.0, MIT,
Copyright (c) 2021 Simon Nilsson. Its upstream artwork is Material Icon Theme
(https://github.com/PKief/vscode-material-icon-theme). The MIT notice is retained
in the package root license. No upstream executable implementation is copied.

`pnpm icons:generate` extracts 113 selected SVGs and matching tables from that
public dependency into the colocated generated JSON assets. The hand-maintained
catalog selects developer and personal-vault categories, groups less-common
tool logos, and adds notes/office/media aliases. `pnpm icons:check` fails on
drift and runs in the specification validation lanes. Browser imports contain
only these assets and Design Core's own resolver, never the full icon package.
The source catalog version and generated artwork SHA are printed by that check.

JJButler's filename categories were inspected as coverage references only. Its
component, resolver, mapping implementation and SVG assets are not copied.

Design Core owns native CSS sizing, basename normalization, decorative/named
accessibility, exported props and documented tokens. This is a project-authored
primitive, not a shadcn registry conversion.
