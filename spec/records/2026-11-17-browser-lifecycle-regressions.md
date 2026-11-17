# Three browser lifecycle regressions

[Core #92](https://github.com/lapismd/design-core/issues/92) records the exact
three Chromium failures on unchanged main and the adoption candidate. The full
supported Ubuntu Shadcn lane initially passed 193, skipped one governed engine
case and failed three; the isolated exact selection failed all three.

The desktop filter assertion read the opening Popover at its authored 0.95
scale: 768 pixels became 729.6. Acceptance now awaits the same original
760-pixel bound before inspecting aligned controls. Its thresholds and narrow
viewport checks are unchanged.

The custom Column Canvas story asserted portalled Popover visibility before
asynchronous placement/animation completed. Its play therefore stopped midway,
leaving a preview over the later browser toggle. The story now awaits the same
visible assertion through the existing governed wait helper. All interactive
steps, portal checks, controller assertions and timeouts remain intact.

The controlled emoji popup retained its old selection panel during the closing
animation. Rapid reopening reused that panel and its `fire` search. The owning
component now disposes the popup panel session as soon as controlled open state
becomes false; inline presentation remains mounted independently. The original
browser case additionally captures the old library instance and proves it is
detached before reopening with empty search and exactly one fresh instance.

The wider first rerun exposed three accessibility failures on the empty closing
shell: Bits UI had removed its role while its old accessible label remained.
The new exact captured-shell label assertion fails once before repair. The
owning component now removes that label with controlled closure; the popup
retains its open-state accessible name. No axe rule or exclusion is changed.

The emoji lifecycle fix owns a public patch Changeset. No visual baseline or
threshold is changed. Focused reruns, the complete directly affected story/browser
families, full source validation and packed/consumer qualification are required
before release; the final results are recorded below.

A full supported-Ubuntu Storybook run exposed 24 additional opening-readiness
assertions across 16 existing story files (1042 passed). Unchanged main reproduces
all 24, plus the original custom Column preview and a custom Dialog's equivalent
visibility assertion (26 failed, 1040 passed). The owning stories now await the
same actual visibility or exact 32-pixel geometry through their existing governed
wait helper. No delay, global animation override, parallelism change, assertion
relaxation or new accessibility exclusion is introduced. Their focused and full
reruns below qualify those corrections.

The first directly affected 68-case rerun passed 67 and exposed the second-open
status control's equivalent immediate assertion. After awaiting that same visible
state, exact status acceptance exposed the same closing-label accessibility
defect in the owning status overflow. It now removes its own label with closure;
the story also captures the shell and verifies label removal while retaining
custom-control identity and original mount/disposal counts. The public patch
Changeset includes both owned closing-shell fixes.

Final qualification passes the original three browser regressions, the captured
closing-shell regression and all 68 directly affected story cases. Full Storybook
improves from unchanged main's 26 failures/1040 passes to zero failures/1066 passes
across 287 files in the supported Ubuntu environment. Its final 197-case pointer
lane passes 196 with one existing governed engine skip. The same final product
source passes 1133 units, three Turbo tests, 62 release tests, zero Svelte/type
warnings, three specification lanes, formatting, static Storybook and visual
metadata (zero contract errors), 27 Workspace, 17 Shell and three AI browser
cases. Every constituent of the canonical nonvisual `pnpm checks` recipe ran;
the supported Ubuntu process supplies browser/Storybook qualification while
native quality and the other browser lanes use their owning environment.

Native Arch full-story attempts had separate dynamic-import setup failures;
the supported Ubuntu run collects and passes the complete suite. All source
assertions, deadlines, worker settings, accessibility rules and baseline bytes
remain intact. Modified formerly approved visual scenarios are `visual-pending`;
their reviewed baselines are not rewritten. A local source-candidate tarball
also builds successfully; actual publication and released consumer intake remain
separate steps under the existing release gates.

The unchanged development graph also has two HIGH picomatch findings, tracked
separately in [Core #94](https://github.com/lapismd/design-core/issues/94):
Changesets/config uses 4.0.7 and Tailwind CLI/Parcel watcher/micromatch uses 2.3.2.
Production audit has zero findings. This slice adds no ignore or exception and
does not transfer another repository's approval. Existing source, packed-audit,
publication and activation policy remain authoritative.
