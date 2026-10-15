export const Basic = `<script lang="ts">
  import { MessageActions, MarkdownContent, type MessageAction } from "@lapismd/design-core/chat";
  let result = $state("");
  const actions: MessageAction[] = [
    { id: "reply", label: "Reply", primary: true, onSelect: () => { result = "Reply requested"; } },
    { id: "copy", label: "Copy message", onSelect: () => { result = "Copy requested"; } },
    { id: "edit", label: "Edit", disabledReason: "Only the author can edit", onSelect: () => {} },
  ];
</script>
<MessageActions {actions} label="Actions for Sam's message">
  <MarkdownContent content="A shared message with **formatting**." />
</MessageActions>
<output>{result}</output>`;
export const Reactions = `<script lang="ts">
  import { MessageActions } from "@lapismd/design-core/chat";
  let selected = $state("");
  const customEmojis = [{ id: "team", shortcode: "team", label: "Team", url: "https://example.test/team.png" }];
</script>
<MessageActions actions={[]} {customEmojis} onAddReaction={(emoji, custom) => { selected = custom?.shortcode ?? emoji; }} />
<output>{selected}</output>
<!-- Supplying emojis={[]} offers no choices; custom registrations do not bypass restrictions. -->`;
