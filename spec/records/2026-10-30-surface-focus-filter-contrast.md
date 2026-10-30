# Surface focus lifetime and selected filter contrast

Desktop's exact Large Transcript case fails its focus assertion and records one
fatal derived_inert warning. AppShellSurfaceLayer's queued cleanup reads a
returnFocus getter belonging to the already destroyed transcript owner.

The new Surface owner teardown story updates the explicit target and then
destroys its owning derived value. It fails one case before the repair with the
same fatal diagnostic. The layer now caches the latest target while mounted,
captures it before queueing restoration, and cancels pending initial focus when
the layer is retired. The exact story passes afterward, as do all 27 cases in
the five AppShell story files and the complete type/consumer checks.

Desktop's dark SearchOwner Ready case independently fails accessibility once:
Current files has 2.32:1 contrast. The new Selected label in Lapis dark picker
story reproduces one accessibility failure. Active labels now use the existing
form foreground, with accent retained in border and background; the exact
source regression passes without changing any audit rule or baseline.

Full `pnpm checks` passes: 917 unit and 976 Storybook cases, static/type/spec
and metadata checks, Workspace 16, Shell 17, AI 3, and Shadcn 153 with one
existing skip. The subsequent complete Storybook run after the independent
file-list readiness repair also passes all 976 cases. Prepared public-package
intake, original Desktop reruns and hosted checks remain required. Both stories
retain visual-pending. No public prop or export, publication, installed
application or user profile changes.
