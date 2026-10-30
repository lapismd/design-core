# Delayed transcript scroll delivery

PR 40's first hosted Storybook run (41117146952) passes 975 cases and fails
DocumentScrollRecovery once: after captured output grows, the viewport remains
221 pixels above the bottom. The unchanged exact case passes once locally.

The resize observer deliberately schedules bottom restoration in an animation
frame. A delayed scroll event from the preceding jump can arrive after layout
growth and before that frame. The previous handler interprets the new bottom
distance as upward reading and clears following, despite unchanged scrollTop.

Two deterministic production Transcript stories deliver that delayed event
after the fixture's real content expansion and before resize restoration. Both
DocumentDelayedScrollRecovery and ClassicDelayedScrollRecovery fail before the
repair with the original bottom-distance assertion. No timeout, tolerance or
diagnostic is weakened. The recovery component now retains following when the
position is unchanged or moving downward; actual upward movement still releases
the lock, and reaching the bottom restores it.

Both exact delayed-delivery cases pass after repair, and the complete original
and delayed scroll-recovery family passes all four cases. The branch is rebased
onto current main 63657fe6; its source tree was identical to the previous base,
so no unrelated work is introduced.

Full owning checks pass: 917 unit and 978 Storybook cases, static/type/spec and
metadata checks, Workspace 16, Shell 17, AI 3, and Shadcn 153 with one existing
skip. The first complete attempt retains a Shadcn loading failure: 152 pass,
one fails and one skips because Avatar Picker remains on Storybook's preparing
screen before any upload assertion. The unchanged exact case passes once in a
fresh catalog process. A first anchored selector matches zero cases and is not
acceptance. The subsequent deliberate complete `pnpm checks` retry passes;
unchanged successful lanes reuse their normal Turbo cache, and the entire
Shadcn lane runs again in a fresh process. No avatar, readiness-helper, timeout,
assertion, diagnostic or scheduling change is made for that loading failure.

Hosted CI and the final Desktop archive intake remain required. Stories stay
visual-pending; baselines and publication are unchanged.
