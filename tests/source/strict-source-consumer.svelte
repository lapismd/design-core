<script lang="ts">
  import {
    Transcript,
    TranscriptController,
    HistoryEdge,
    CommentQueue,
    type TranscriptItem,
  } from "@lapismd/design-core/chat";
  const transcriptItems: TranscriptItem[] = [];
  const transcriptController = new TranscriptController(() => ({
    items: transcriptItems,
  }));
  import {
    TagList,
    type TagListItem,
    type TagListProps,
  } from "@lapismd/design-core/shadcn/tag-list";
  const tagItems: readonly TagListItem[] = [
    {
      id: "shared",
      label: "Shared",
      variant: "outline",
      tone: "accent",
      active: true,
      onClick: (_tag, event) => event.preventDefault(),
    },
  ];
  const tagListProps = {
    tags: tagItems,
    size: "sm",
    label: "Shared tags",
  } satisfies TagListProps;
  import {
    ResponsiveTabs,
    type ResponsiveTab,
  } from "@lapismd/design-core/shadcn/responsive-tabs";
  import { Avatar, type AvatarProps } from "@lapismd/design-core/shadcn/avatar";
  import {
    AvatarPicker,
    type AvatarPickerProps,
  } from "@lapismd/design-core/forms/avatar-picker";
  import { AppShell } from "@lapismd/design-core/shell";
  import {
    MarkdownContent,
    CommentComposer,
    type CommentComposerProps,
    MarkdownComposer,
    MessageActions,
    ReactionBar as SharedReactionBar,
    type MarkdownComposerProps,
    type MarkdownComposerHandle,
    type MarkdownComposerReply,
    type MarkdownContentProps,
  } from "@lapismd/design-core/chat";
  let sharedHandle = $state<MarkdownComposerHandle | null>(null);
  const commentProps = {
    value: "A retained comment",
    source: { label: "Captured code", quote: "const value = 1;", kind: "code" },
    onSubmit: (_snapshot: string) => {},
    onNavigateSource: (opener: HTMLButtonElement) => opener.focus(),
  } satisfies CommentComposerProps;
  const sharedReply = {
    authorName: "Sam",
    content: "A quoted message",
  } satisfies MarkdownComposerReply;
  const sharedComposerProps = {
    value: "Draft",
    reply: sharedReply,
    onCancelReply: () => {},
    onSubmit: (_snapshot: string) => {},
  } satisfies MarkdownComposerProps;
  const navItems = [
    { value: "overview", label: "Overview" },
  ] satisfies ResponsiveTab[];
  const avatarProps = {
    name: "Alex",
    presence: "online",
  } satisfies AvatarProps;
  const pickerProps = {
    name: "Alex",
    onUploadImage: async (_file: File, _signal: AbortSignal) => "/avatar.png",
  } satisfies AvatarPickerProps;
  const markdownProps = {
    content: "**Hello**",
    extensions: [],
    linkResolver: ({ href }) => href,
    assetResolver: ({ src }) => src,
  } satisfies MarkdownContentProps;

  import * as Dialog from "@lapismd/design-core/shadcn/dialog";
  import { DialogFrame } from "@lapismd/design-core/forms/dialog";
  import { ConfirmDialog } from "@lapismd/design-core/forms/dialog";
  import { ConfirmButton } from "@lapismd/design-core/forms/dialog";
  import { ComposerInput, ToolCalls } from "@lapismd/design-core/ai/chat";
  import { ReactionBar } from "@lapismd/design-core/ai/experimental";
  import {
    PowerSearch,
    createDemoLedgerFilterSyntax,
    type PowerSearchToken,
  } from "@lapismd/design-core/filter";
  import * as DropdownMenu from "@lapismd/design-core/shadcn/dropdown-menu";
  import { Spinner } from "@lapismd/design-core/shadcn/spinner";
  import {
    PanelToggle,
    PanelToggleIcon,
    type PanelToggleIconProps,
  } from "@lapismd/design-core/shadcn/panel-toggle";
  import {
    EmojiPicker,
    type CustomEmoji,
    type EmojiPickerProps,
  } from "@lapismd/design-core/shadcn/emoji-picker";
  import { EmojiPicker as LegacyEmojiPicker } from "@lapismd/design-core/ai/experimental";
  const emojiProps = {
    customEmojis: [
      { id: "team:gem", shortcode: "gem", url: "/gem.png" },
    ] satisfies CustomEmoji[],
    theme: "dark",
    onSelect: (_value, custom) => {
      custom?.id;
    },
  } satisfies EmojiPickerProps;

  const panelIcon = {
    side: "bottom",
    iconVariant: "standard",
    expanded: false,
    class: "consumer-panel-icon",
    style: "color: currentColor",
  } satisfies PanelToggleIconProps;

  let filter = $state("all");
  let tokens = $state<PowerSearchToken[]>([]);
  const filterSyntax = createDemoLedgerFilterSyntax();
</script>

<TagList {...tagListProps} />

<DropdownMenu.Root>
  <DropdownMenu.Trigger>Filter</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.RadioGroup bind:value={filter}>
      <DropdownMenu.RadioItem value="all">All</DropdownMenu.RadioItem>
    </DropdownMenu.RadioGroup>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<Spinner />
<EmojiPicker {...emojiProps} />
<LegacyEmojiPicker emojis={[]} onSelect={() => {}} />
<PanelToggle side="bottom" iconVariant="standard" expanded={false} />
<PanelToggleIcon {...panelIcon} data-icon="inline-start" />
<ComposerInput />
<ToolCalls calls={[{ name: "read", status: "complete" }]} />
<ReactionBar reactions={[]} onAdd={() => {}} />
<PowerSearch
  {tokens}
  {filterSyntax}
  onTokensChange={(nextTokens) => {
    tokens = nextTokens;
  }}
/>

<ConfirmDialog
  open={false}
  title="Remove"
  description="Remove the record"
  onConfirm={async () => {}}
/>
<ConfirmButton
  title="Remove"
  description="Remove the record"
  onConfirm={async () => {}}>Remove</ConfirmButton
>

<Dialog.Root open={false}
  ><DialogFrame title="Record"
    ><p>Fields</p>
    {#snippet footer()}<button type="button">Save</button
      >{/snippet}</DialogFrame
  ></Dialog.Root
>

<ResponsiveTabs value="overview" items={navItems} /><Avatar
  {...avatarProps}
/><AvatarPicker {...pickerProps} /><MarkdownContent
  {...markdownProps}
/><AppShell.Topbar />

<MarkdownComposer {...sharedComposerProps} bind:handle={sharedHandle}>
  {#snippet avatar()}<span aria-hidden="true">AM</span>{/snippet}
</MarkdownComposer>
<CommentComposer {...commentProps} />
<MessageActions actions={[]}><p>Strict shared message</p></MessageActions>
<SharedReactionBar reactions={[{ emoji: "👍", count: 1 }]} />

<Transcript items={transcriptItems} commentState={transcriptController} />
<HistoryEdge state="loading" />
<CommentQueue state={transcriptController} />
