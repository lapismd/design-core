# Verification

This matrix records one current evidence status for every canonical requirement. `Implemented` means the current behavior has source or scenario evidence; it does not claim exhaustive automated coverage. `Partial` marks incomplete evidence. `In progress` marks governance introduced by this migration but not yet enforced.

| Requirement   | Status      | Evidence                                                                                    |
| ------------- | ----------- | ------------------------------------------------------------------------------------------- |
| DC-ARCH-001   | Implemented | `spec/src/`; tracked repository guidance                                                    |
| DC-ARCH-002   | Implemented | `src/shared/`; `package.json#exports`                                                       |
| DC-ARCH-003   | Implemented | Forms, Shell, and Workspace controller sources and stories                                  |
| DC-ARCH-004   | Implemented | `package.json#exports`; family barrels and focused component entry points                   |
| DC-ARCH-005   | Implemented | Tracked workspace guidance; linked package manifests                                        |
| DC-ARCH-006   | Implemented | versioned package manifest, cache-free tarball inventory, and external Roles consumer check |
| DC-PKG-001    | Implemented | `package.json#exports`; referenced barrels                                                  |
| DC-PKG-002    | Implemented | `package.json#exports`; referenced barrels                                                  |
| DC-PKG-003    | Implemented | `package.json#exports`; forms barrel and focused Filter Command Picker entry point          |
| DC-PKG-004    | Implemented | `package.json#exports`; referenced barrels                                                  |
| DC-PKG-005    | Implemented | `package.json#exports`; referenced barrels                                                  |
| DC-PKG-006    | Implemented | `package.json#exports`; referenced barrels                                                  |
| DC-PKG-007    | Implemented | `package.json#exports`; referenced barrels                                                  |
| DC-PKG-008    | Implemented | `packages/storybook-addon-docs-mcp/`; root workspace manifest                               |
| DC-PKG-009    | Implemented | package manifest, cache-free `pnpm pack` inventory, and external Roles consumer check       |
| DC-PKG-010    | Implemented | `package.json#exports`; referenced Diff barrel                                              |
| DC-CSS-001    | Implemented | `styles.md`; `src/styles.css`; theme and token sources; no-Tailwind check                   |
| DC-CSS-002    | Implemented | Resolved Workspace view token maps and surface story assertions                             |
| DC-CSS-003    | Implemented | `styles.md`; `src/styles.css`; theme and token sources; no-Tailwind check                   |
| DC-CSS-004    | Implemented | `styles.md`; `src/styles.css`; theme and token sources; no-Tailwind check                   |
| DC-CSS-005    | Implemented | `styles.md`; `src/styles.css`; theme and token sources; no-Tailwind check                   |
| DC-CSS-006    | Implemented | `src/styles.css`; `src/themes/lapis.spec.ts`; linked Electron consumer acceptance           |
| DC-CSS-007    | Implemented | `src/themes/lapis.css`; `src/themes/lapis.spec.ts`                                          |
| DC-TOOL-001   | Implemented | Root scripts; `scripts/ui-generator/`; `packages/storybook-addon-docs-mcp/`                 |
| DC-TOOL-002   | Implemented | Root scripts; `scripts/ui-generator/`; `packages/storybook-addon-docs-mcp/`                 |
| DC-TOOL-003   | Implemented | Root scripts; `scripts/ui-generator/`; `packages/storybook-addon-docs-mcp/`                 |
| DC-TOOL-004   | Implemented | Root scripts; `scripts/ui-generator/`; `packages/storybook-addon-docs-mcp/`                 |
| DC-SHA-001    | Implemented | Shadcn family sources, stories, pointer tests, and component audit                          |
| DC-SHA-002    | Implemented | src/shared/shadcn/button/; colocated stories                                                |
| DC-SHA-003    | Implemented | src/shared/shadcn/button-group/; colocated stories                                          |
| DC-SHA-004    | Implemented | src/shared/shadcn/swipe-item/; colocated stories                                            |
| DC-SHA-005    | Implemented | src/shared/shadcn/toggle/; colocated stories                                                |
| DC-SHA-006    | Implemented | src/shared/shadcn/toggle-group/; colocated stories                                          |
| DC-SHA-007    | Implemented | src/shared/shadcn/code/; colocated stories                                                  |
| DC-SHA-008    | Implemented | src/shared/shadcn/code-block/; colocated stories                                            |
| DC-SHA-009    | Implemented | Shadcn family sources, stories, pointer tests, and component audit                          |
| DC-SHA-010    | Implemented | src/shared/shadcn/badge/; colocated stories                                                 |
| DC-SHA-011    | Implemented | src/shared/shadcn/table/; colocated stories                                                 |
| DC-SHA-012    | Implemented | src/shared/shadcn/alert/; colocated stories                                                 |
| DC-SHA-013    | Implemented | src/shared/shadcn/empty/; colocated stories                                                 |
| DC-SHA-014    | Implemented | src/shared/shadcn/progress/; colocated stories                                              |
| DC-SHA-015    | Implemented | src/shared/shadcn/skeleton/; colocated stories                                              |
| DC-SHA-016    | Implemented | src/shared/shadcn/spinner/; colocated stories                                               |
| DC-SHA-017    | Implemented | Shadcn family sources, stories, pointer tests, and component audit                          |
| DC-SHA-018    | Implemented | src/shared/shadcn/accordion/; colocated stories                                             |
| DC-SHA-019    | Implemented | src/shared/shadcn/collapsible/; colocated stories                                           |
| DC-SHA-020    | Implemented | src/shared/shadcn/tabs/; colocated stories                                                  |
| DC-SHA-021    | Implemented | src/shared/shadcn/breadcrumb/; colocated stories                                            |
| DC-SHA-022    | Implemented | src/shared/shadcn/pagination/; colocated stories                                            |
| DC-SHA-023    | Implemented | Shadcn family sources, stories, pointer tests, and component audit                          |
| DC-SHA-024    | Implemented | src/shared/shadcn/checkbox/; colocated stories                                              |
| DC-SHA-025    | Implemented | src/shared/shadcn/command/; dialog positioning interaction; colocated stories               |
| DC-SHA-026    | Implemented | src/shared/shadcn/field/; colocated stories                                                 |
| DC-SHA-027    | Implemented | Input focus-ring story                                                                      |
| DC-SHA-028    | Implemented | src/shared/shadcn/input-group/; colocated stories                                           |
| DC-SHA-029    | Implemented | src/shared/shadcn/label/; colocated stories                                                 |
| DC-SHA-030    | Implemented | src/shared/shadcn/select/; colocated stories                                                |
| DC-SHA-031    | Implemented | src/shared/shadcn/slider/; colocated stories                                                |
| DC-SHA-032    | Implemented | src/shared/shadcn/switch/; colocated stories                                                |
| DC-SHA-033    | Implemented | Textarea focus-ring story                                                                   |
| DC-SHA-034    | Implemented | Shadcn family sources, stories, pointer tests, and component audit                          |
| DC-SHA-035    | Implemented | src/shared/shadcn/card/; colocated stories                                                  |
| DC-SHA-036    | Implemented | Column Canvas controller source, unit tests, and colocated stories                          |
| DC-SHA-037    | Implemented | src/shared/shadcn/resizable/; colocated stories                                             |
| DC-SHA-038    | Implemented | src/shared/shadcn/scroll-area/; colocated stories                                           |
| DC-SHA-039    | Implemented | src/shared/shadcn/separator/; colocated stories                                             |
| DC-SHA-040    | Implemented | src/shared/shadcn/sidebar/; colocated stories                                               |
| DC-SHA-041    | Implemented | Shadcn family sources, stories, pointer tests, and component audit                          |
| DC-SHA-042    | Implemented | src/shared/shadcn/alert-dialog/; colocated stories                                          |
| DC-SHA-043    | Implemented | src/shared/shadcn/context-menu/; colocated stories                                          |
| DC-SHA-044    | Implemented | src/shared/shadcn/dialog/; modal scrim interactions; colocated stories                      |
| DC-SHA-045    | Implemented | src/shared/shadcn/drawer/; colocated stories                                                |
| DC-SHA-046    | Implemented | src/shared/shadcn/dropdown-menu/; colocated stories                                         |
| DC-SHA-047    | Implemented | src/shared/shadcn/hover-card/; colocated stories                                            |
| DC-SHA-048    | Implemented | src/shared/shadcn/popover/; colocated stories                                               |
| DC-SHA-049    | Implemented | src/shared/shadcn/sheet/; colocated stories                                                 |
| DC-SHA-050    | Implemented | src/shared/shadcn/tooltip/; colocated stories                                               |
| DC-FORM-001   | Implemented | Forms core and family sources, unit tests, and Storybook scenarios                          |
| DC-FORM-002   | Implemented | Structured Form source, type tests, rendered MDX, and Storybook scenarios                   |
| DC-FORM-003   | Implemented | Forms family source and colocated Storybook scenarios for YAML Backed Form                  |
| DC-FORM-004   | Implemented | Forms family source and colocated Storybook scenarios for JSON Backed Form                  |
| DC-FORM-005   | Implemented | Forms family source and colocated Storybook scenarios for Patchable Form                    |
| DC-FORM-006   | Implemented | Forms core and family sources, unit tests, and Storybook scenarios                          |
| DC-FORM-007   | Implemented | Forms family source and colocated Storybook scenarios for Autocomplete Input                |
| DC-FORM-008   | Implemented | Forms family source and colocated Storybook scenarios for Chip Autocomplete                 |
| DC-FORM-009   | Implemented | Forms family source and colocated Storybook scenarios for Color Picker                      |
| DC-FORM-010   | Implemented | Forms family source and colocated Storybook scenarios for Cycle Picker                      |
| DC-FORM-011   | Implemented | Forms family source and colocated Storybook scenarios for Date Picker                       |
| DC-FORM-012   | Implemented | Forms family source, focused export, and colocated Filter Command Picker stories            |
| DC-FORM-013   | Implemented | Forms family source and colocated Storybook scenarios for Inline Option Picker              |
| DC-FORM-014   | Implemented | Forms family source and colocated Storybook scenarios for List Editor                       |
| DC-FORM-015   | Implemented | Forms family source and colocated Storybook scenarios for Reference Picker                  |
| DC-FORM-016   | Implemented | Forms family source and colocated Storybook scenarios for Secret Field                      |
| DC-FORM-017   | Implemented | Forms family source and colocated Storybook scenarios for Segmented Control                 |
| DC-FORM-018   | Implemented | Forms family source and colocated Storybook scenarios for Task Due Calendar                 |
| DC-FORM-019   | Implemented | Forms family source and colocated Storybook scenarios for Time Picker                       |
| DC-FORM-020   | Implemented | Forms family source and colocated Storybook scenarios for Search Filter in a Form           |
| DC-FORM-021   | Implemented | Forms core and family sources, unit tests, and Storybook scenarios                          |
| DC-FORM-022   | Implemented | Add Section Chooser source and confirmed-contrast Storybook scenarios                       |
| DC-FORM-023   | Implemented | Forms family source and colocated Storybook scenarios for Collapsible Item List             |
| DC-FORM-024   | Implemented | Forms family source and colocated Storybook scenarios for Entry Actions                     |
| DC-FORM-025   | Implemented | Forms family source and colocated Storybook scenarios for Form Add Button                   |
| DC-FORM-026   | Implemented | Forms family source and colocated Storybook scenarios for Form Field                        |
| DC-FORM-027   | Implemented | Forms family source and colocated Storybook scenarios for Form Placeholder                  |
| DC-FORM-028   | Implemented | Forms family source and colocated Storybook scenarios for Form Section Header               |
| DC-FORM-029   | Implemented | Forms family source and colocated Storybook scenarios for Form Sheet                        |
| DC-FORM-030   | Implemented | Forms family source and colocated Storybook scenarios for Form Toolbar                      |
| DC-FORM-031   | Implemented | Forms family source and colocated Storybook scenarios for Sortable Array Item               |
| DC-FORM-032   | Implemented | Forms core and family sources, unit tests, and Storybook scenarios                          |
| DC-FORM-033   | Implemented | Forms family source and colocated Storybook scenarios for Code Editor                       |
| DC-FORM-034   | Implemented | Forms family source and colocated Storybook scenarios for Code Highlighter                  |
| DC-FORM-035   | Implemented | YAML editor unit/catalog coverage and linked Lapis consumer type check                      |
| DC-FORM-036   | Implemented | Forms core and family sources, unit tests, and Storybook scenarios                          |
| DC-FORM-037   | Implemented | Forms family source and colocated Storybook scenarios for Form Review                       |
| DC-FORM-038   | Implemented | Forms family source and colocated Storybook scenarios for Field Review Actions              |
| DC-FORM-039   | Implemented | Forms family source and colocated Storybook scenarios for Unified Review Diff               |
| DC-FORM-040   | Implemented | Forms core and family sources, unit tests, and Storybook scenarios                          |
| DC-FORM-041   | Implemented | Forms family source and colocated Storybook scenarios for Complete CV Form                  |
| DC-FILTER-001 | Implemented | Filter sources, parser tests, catalog stories, and guidance                                 |
| DC-FILTER-002 | Implemented | Filter sources, parser tests, catalog stories, and guidance                                 |
| DC-FILTER-003 | Implemented | Filter sources, parser tests, catalog stories, and guidance                                 |
| DC-FILTER-004 | Implemented | Filter sources, parser tests, catalog stories, and guidance                                 |
| DC-FILTER-005 | Implemented | Filter sources, parser tests, catalog stories, and guidance                                 |
| DC-AI-001     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-002     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-003     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-004     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-005     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-006     | Implemented | Message Bubble sender-color story                                                           |
| DC-AI-007     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-008     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-009     | Implemented | Composer portable-shadow story                                                              |
| DC-AI-010     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-011     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-012     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-013     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-014     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-015     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-016     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-017     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-018     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-019     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-020     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-021     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-022     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-AI-023     | Implemented | AI sources, controllers, Storybook scenarios, and browser acceptance                        |
| DC-DIFF-001   | Implemented | Diff layer contract, tokens, guidance, and headless core models                             |
| DC-DIFF-002   | Implemented | File Listing sources, view-mode toggle, unit tests, and Storybook scenarios                 |
| DC-DIFF-003   | Implemented | File Diff unified, split, and multi-file composer sources and Storybook scenarios           |
| DC-DIFF-004   | Implemented | Merge Editor sources, inward merge actions, pane-edit reassembly, and Storybook scenarios   |
| DC-DIFF-005   | Implemented | `src/shared/diff/Guidance.mdx`                                                              |
| DC-DIFF-006   | Implemented | File Change Stats sources, `formatDiffDelta` unit tests, and Storybook scenarios            |
| DC-SHELL-001  | Implemented | `src/shared/shell/`; Shell guidance and tests                                               |
| DC-SHELL-002  | Implemented | App Shell sources, guidance, stories, and pointer tests                                     |
| DC-SHELL-003  | Implemented | `src/shared/shell/Guidance.mdx`                                                             |
| DC-WS-001     | Implemented | Workspace framework sources, guidance, stories, and tests                                   |
| DC-WS-002     | Implemented | Typed consumer intents, unit tests, and Storybook coverage                                  |
| DC-WS-003     | Implemented | Workspace framework sources, guidance, stories, and tests                                   |
| DC-WS-004     | Implemented | Workspace framework sources, guidance, stories, and tests                                   |
| DC-WS-005     | Implemented | Workspace framework sources, guidance, stories, and tests                                   |
| DC-WS-006     | Implemented | View Host surface tokens, guidance, and surface story assertions                            |
| DC-WS-007     | Implemented | Workspace framework sources, guidance, stories, and tests                                   |
| DC-WS-008     | Implemented | About Dialog source, public barrel, and accessible Storybook scenarios                      |
| DC-WS-009     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-010     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-011     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-012     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-013     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-014     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-015     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-016     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-017     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-018     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-019     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-020     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-021     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-022     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-023     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-024     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-025     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-026     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-027     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-028     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-029     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-030     | Implemented | Shared live leaf-label renderer across workspace surfaces and Storybook coverage            |
| DC-WS-031     | Implemented | Workspace component source, public barrel, and colocated Storybook scenarios                |
| DC-WS-032     | Implemented | Structured WorkspaceViewChrome badge contract and accessible shared presentation            |
| DC-WS-033     | Implemented | Explorer activation, chrome, identity tests, and stories                                    |
| DC-WS-034     | Implemented | Problems filter menu, badges, table icon, and Storybook scenarios                           |
| DC-WS-035     | Implemented | Workspace plugin sources, tests, and Storybook scenarios                                    |
| DC-WS-036     | Implemented | Workspace plugin sources, tests, and Storybook scenarios                                    |
| DC-WS-037     | Implemented | Workspace plugin sources, tests, and Storybook scenarios                                    |
| DC-WS-038     | Implemented | App Shell navigation contract, sidebar presentation, and Storybook interaction              |
| DC-WS-039     | Implemented | Managed plugin registry tests and grouped Core plugins Storybook interaction                |
| DC-WS-040     | Implemented | Managed plugin registry source, lifecycle delegation, and unit tests                        |
| DC-CAT-001    | Implemented | `.storybook/`; `src/**/*.stories.svelte`; current static Storybook index                    |
| DC-CAT-002    | Implemented | `.storybook/`; `src/**/*.stories.svelte`; current static Storybook index                    |
| DC-CAT-003    | Implemented | `.storybook/`; `src/**/*.stories.svelte`; current static Storybook index                    |
| DC-CAT-004    | Implemented | `.storybook/`; `src/**/*.stories.svelte`; current static Storybook index                    |
| DC-CAT-005    | Implemented | `src/spec/**/*.mdx`; Storybook ordering and mirror validator                                |
| DC-CAT-006    | Implemented | Public-boundary `*.example-sources.ts` modules and catalog validator                        |
| DC-CAT-007    | Implemented | Typed `parameters.docs.source` metadata and catalog validator                               |
| DC-CAT-008    | Implemented | Tokenizing Storybook languages, catalog validator, and live DOM acceptance                  |
| DC-GOV-001    | Implemented | Canonical requirement chapters and verification matrix                                      |
| DC-GOV-002    | Implemented | Canonical requirement chapters and verification matrix                                      |
| DC-GOV-003    | Implemented | `pnpm spec:validate`; canonical, package-export surface, book, and mirror tests             |
| DC-GOV-004    | Implemented | `pnpm spec:first`; local and CI diff tests                                                  |
| DC-GOV-005    | Implemented | `.qmd/index.yml`; `pnpm spec:index`                                                         |
| DC-GOV-006    | Implemented | `pnpm spec:search`; QMD wrapper tests and `rg` fallback                                     |
| DC-GOV-007    | Implemented | `AGENTS.md`; `pnpm ui guide specification`                                                  |
| DC-GOV-008    | Implemented | `.gitignore`; book and QMD tracking validators                                              |
| DC-GOV-009    | Implemented | Storybook source validator and focused validator tests                                      |
