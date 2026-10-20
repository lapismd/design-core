# Centered transcript system-message review

Date: 2026-10-20. Requirement: DC-CHAT-006. Status: visual-pending.

The user paused full native implementation and full validation while reviewing
the desktop chat UI. Transcript now renders label-only context facts through
the existing SystemMessage divider in Document and Classic. A small owned
label supplies the icon and neutral/warning background; an available host
timestamp uses the shared RelativeTime component beneath, without a prefix.
Error notices and context bodies retain their existing
presentation. No exported type or storage contract changed.
Divider separators use a zero flex basis so they share the remaining width
without squeezing the centered label; long labels truncate on one line.

The exact review target is Chat/Transcript/Centered system messages, plus the
desktop native conversation route preview. Before this slice, every context
fact used a disclosure, while warning notices repeated identical title/body
text. The desktop source now supplies label-only facts rather than duplicate
Markdown blocks.

Commands: read tracked/parent guidance, `pnpm ui guide`, `pnpm ui guide layers`,
`pnpm ui guide specification`, narrow source/spec searches, and explicit-path
Prettier formatting. `packLocal` generated a temporary preview package; the
first archive predates the final label/timestamp adjustment and was not adopted.
The current preview archive is selected separately in desktop's ignored local
archive manifest. Packaging is preview preparation, not behavioral qualification.

Checks, unit/Storybook/browser suites, release and baseline updates remain
deferred by the user. No milestone is completed and no verified commit is
claimed. The next action is user review followed by authorized focused
qualification and consumer acceptance.
