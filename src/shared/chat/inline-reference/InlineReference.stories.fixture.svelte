<script lang="ts">
  import { untrack } from "svelte";
  import {
    MarkdownComposer,
    MarkdownContent,
    spoilerExtension,
  } from "../index.js";
  import FolderIcon from "@lucide/svelte/icons/folder-git-2";
  import BotIcon from "@lucide/svelte/icons/bot";
  import { Button } from "../../shadcn/button/index.js";
  import {
    createChatReferenceExtension,
    chatReferenceTriggers,
  } from "./reference-extension.js";
  import type {
    ChatReference,
    ChatReferenceOptions,
  } from "./inline-reference.types.js";
  let {
    legacy = false,
    presentation = "framed",
  }: {
    legacy?: boolean;
    presentation?: "document" | "framed";
  } = $props();
  let opened = $state(""),
    sent = $state("");
  const emoji = {
    id: "lapis",
    kind: "emoji",
    label: ":lapis:",
    presentation: "emoji" as const,
    avatar: {
      id: "lapis",
      name: "Lapis",
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='%236958bd'/%3E%3C/svg%3E",
    },
  };
  const references: ChatReference[] = [
    {
      id: "alex",
      kind: "person",
      label: "Alex Morgan",
      href: "/people/alex",
      avatar: { id: "alex", name: "Alex Morgan", initials: "AM" },
    },
    {
      id: "reviewer",
      kind: "agent",
      label: "Reviewer",
      href: "app:agents/reviewer",
      icon: BotIcon,
    },
    {
      id: "repo",
      kind: "repository",
      label: "Lapis Desktop",
      href: "/repos/desktop",
      icon: FolderIcon,
    },
  ];
  const options: ChatReferenceOptions = {
    resolve: (href) => references.find((reference) => reference.href === href),
    matches: (text) =>
      [...text.matchAll(/host-person:alex;|:lapis:/g)].map((match) => ({
        from: match.index!,
        to: match.index! + match[0].length,
        reference: match[0] === ":lapis:" ? emoji : references[0]!,
      })),
    onActivate: (reference) => {
      opened = reference.id;
    },
    getPopover: (reference) =>
      reference.kind === "person" ? profile : undefined,
    ...(untrack(() => legacy)
      ? {
          serialize: (reference: ChatReference) =>
            reference.id === "alex"
              ? "host-person:alex;"
              : `[${reference.label}](${reference.href})`,
        }
      : {}),
  };
  const extension = createChatReferenceExtension(options);
  const triggers = chatReferenceTriggers(
    [
      {
        character: "@",
        label: "People and agents",
        search: (query, signal) =>
          signal.aborted
            ? []
            : references.filter(
                (reference) =>
                  reference.kind !== "repository" &&
                  reference.label.toLowerCase().includes(query.toLowerCase()),
              ),
      },
    ],
    options,
  );
  let value = $state(
    "Ask [Alex Morgan](/people/alex) and [Reviewer](app:agents/reviewer) to review [Lapis Desktop](/repos/desktop).\n\nA stored token: host-person:alex; and ||a spoiler||. :lapis:\n\n- [x] Preserve exact source\n- [ ] Review keyboard and pointer controls\n\n> Quoted source stays intact.\n\n| Surface | State |\n| --- | --- |\n| Cell | Ready |\n\n`host-person:alex;` stays literal.\n\nSee [ordinary documentation](https://example.com).",
  );
</script>

{#snippet profile(reference: ChatReference)}
  <strong>{reference.label}</strong>
  <p>Repository principal</p>
  <Button variant="ghost" size="sm" disabled>Message</Button>
{/snippet}

<div class="paired-reference-example">
  <section aria-label="Reference composer">
    <MarkdownComposer
      {presentation}
      bind:value
      {triggers}
      extensions={[extension, spoilerExtension]}
      onSubmit={(text) => {
        sent = text;
      }}
    />
  </section>
  <section aria-label="Reference preview">
    <MarkdownContent
      content={value}
      extensions={[extension, spoilerExtension]}
      fullWidth
    />
  </section>
  <output data-testid="reference-opened">{opened}</output><output
    data-testid="reference-sent">{sent}</output
  >
  <output hidden data-testid="reference-source">{value}</output>
</div>

<style>
  .paired-reference-example {
    display: grid;
    gap: 1rem;
    max-width: 52rem;
    padding: 2rem;
  }
</style>
