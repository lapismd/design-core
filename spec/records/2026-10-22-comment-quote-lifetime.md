# Transcript comment quote lifetime

The Desktop hosted-History qualification initially passes 500 assertions but
reports four unhandled errors. One is a deferred Markdown quote reading a
removed thread during conversation switching. The source component now captures
the current thread in a keyed rendering entry so child getters retain that
entry through teardown.

The new source pending-comment switch story passes before and after; it does
not reproduce the consuming runtime's failure on its own. The actual cold
Desktop target is Conversation Drafts / Separate Conversations, together with
Chat Layout Review and Repository File History: 23 assertions pass before and
after, while unhandled errors fall from four to two. The quote and Explorer
errors are gone; the remaining two belong to Search query settlement.

The first aggregate attempt reports an unmapped new catalog title and a
multi-sentence acceptance bullet. The story now belongs to the existing
Transcript surface and the requirement stays atomic. The next attempt finds
two remaining references to the optional script variable; all child props and
actions now use the captured rendering entry. Complete `pnpm checks` passes with zero type diagnostics: 859 unit cases,
900 Storybook interactions/accessibility cases, static catalog, 16 Workspace,
11 Shell, three AI and 153 Shadcn pointer cases pass, with one inherited skip.
That includes seven WebKit cases. Governance and formatting pass.

DC-CHAT-007 retains its existing milestone status. This repair does not close
other transcript work or approve visual baselines. Consumer and source results
remain separate; the prepared archive is only a local acceptance candidate.
