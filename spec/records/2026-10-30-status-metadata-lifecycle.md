# Status content survives metadata reprojection

Notebook execution progress exposed a custom status-content lifecycle defect:
projecting a fresh descriptor object reran the mount effect even when its mount
callback stayed unchanged. That disposed the status component, closing its
popover and resetting local interaction state. WorkspaceStatusItem now derives
the callback as the effect dependency, preserving the mounted instance across
metadata updates while retaining disposal on callback replacement or removal.

Qualification in isolated workspace notebook-status, base 8e210d23:

- Exact `CustomMetadataPreservesMountedState` story: 1 functional failure
  before, 1 pass after. The story asserts DOM identity and disposer lifetime.
- All affected status-item/status-bar/layout families: 11 passed.
- `pnpm checks`: governance, formatting, strict Svelte/type checks (including
  consumer configurations), 914 unit tests / 142 files, Turbo/release script
  tests, static Storybook, metadata audit and all 974 interaction/axe stories /
  277 files passed. Browser lanes passed 16 workspace, 17 shell, 3 AI and 153
  shadcn checks; the existing 1 WebKit skip remains unchanged.
- `pnpm spec:check`, Node 24 QMD discovery and doctor passed. Doctor reports
  only the intentional script alias warning.
- `pnpm package:local` prepared a browser-ready archive for Notebook's isolated
  acceptance. SHA-256:
  `01c56a18ad754aa58ce63f061e2121831e4b5251ad49d48c07ccd78d814319d8`.
- Notebook's consumer acceptance passed 32 interaction/axe stories, strict
  quality, 303 unit tests, build/bundle/publint, static and specification lanes.

The new story remains visual-pending. No visual baseline was created or updated.
No push, release or publication has occurred.
