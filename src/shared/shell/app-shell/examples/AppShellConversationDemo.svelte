<script lang="ts">
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import {
    Composer,
    Layout,
    Message,
    MessageBubble,
    MessageList,
    MessageMetadata,
    SystemMessage,
    ToolCalls,
  } from "../../../ai/chat.js";
  import ReactionBar from "../../../ai/experimental/reaction-bar/ReactionBar.svelte";
  import Reasoning from "../../../ai/experimental/reasoning/Reasoning.svelte";
  import TypingIndicator from "../../../ai/experimental/typing-indicator/TypingIndicator.svelte";
  import UnreadDivider from "../../../ai/experimental/unread-divider/UnreadDivider.svelte";
  import { Button } from "../../../shadcn/button/index.js";
  import { AppShell } from "../index.js";
  import type { AppShellController } from "../app-shell-controller.svelte.js";

  let {
    controller,
  }: {
    controller: AppShellController;
  } = $props();

  let draft = $state("");
  let submitted = $state("");
</script>

{#snippet inspectDetail()}
  Checked the shared AI source and public package boundaries.
{/snippet}

<AppShell.Sidebar.Header class="ui-shell-story-ai-header">
  {#if controller.mobile.resolvedMode === "mobile" || !controller.right.collapsed}
    <SparklesIcon aria-hidden="true" />
    <strong>AI conversation</strong>
  {/if}
  <AppShell.Sidebar.Close />
</AppShell.Sidebar.Header>

<AppShell.Sidebar.Body class="ui-shell-story-ai-body">
  {#if controller.mobile.resolvedMode === "desktop" && controller.right.collapsed}
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Open AI conversation"
      title="Open AI conversation"
      onclick={() => controller.right.expand()}
    >
      <SparklesIcon aria-hidden="true" />
    </Button>
  {:else}
    <Layout density="compact" aria-label="Complete AI conversation">
      {#snippet composer()}
        <div class="ui-shell-story-ai-composer">
          <TypingIndicator names={["Ada"]} />
          <Composer
            density="compact"
            bind:value={draft}
            onSubmit={(value) => {
              submitted = value;
            }}
          />
        </div>
      {/snippet}

      <MessageList
        density="compact"
        latestMessageId={submitted || "assistant-2"}
      >
        <SystemMessage variant="divider">Today</SystemMessage>
        <Message sender="assistant">
          {#snippet name()}Assistant{/snippet}
          <MessageBubble>
            I can inspect the release and propose a concise summary.
          </MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="10:41" />
          {/snippet}
        </Message>
        <Message sender="user">
          <MessageBubble>Review the changed files first.</MessageBubble>
        </Message>
        <UnreadDivider />
        <Message sender="assistant">
          <MessageBubble variant="ghost">
            <Reasoning
              duration="3s"
              preview="I should inspect the package boundaries."
            >
              {#snippet children()}
                I checked the UI package boundaries and kept networking in the
                host application.
              {/snippet}
            </Reasoning>
            <ToolCalls
              calls={[
                {
                  id: "inspect",
                  name: "Inspect package",
                  target: "src/shared/ai",
                  status: "complete",
                  duration: "420ms",
                  detail: inspectDetail,
                },
              ]}
            />
            The release adds reusable Svelte 5 Chat primitives while preserving the
            existing AI panel API.
          </MessageBubble>
          <ReactionBar
            reactions={[
              { emoji: "🎉", count: 3, selected: true },
              { emoji: "👀", count: 1 },
            ]}
          />
        </Message>
        <Message sender="user">
          <MessageBubble>
            Keep the shared shell independent from routing and persistence.
          </MessageBubble>
        </Message>
        <Message sender="assistant">
          <MessageBubble variant="ghost">
            The shell now owns only geometry and sidebar state. Project
            selection, file navigation, and message submission remain with the
            host application.
          </MessageBubble>
        </Message>
        {#if submitted}
          <Message sender="user">
            <MessageBubble>{submitted}</MessageBubble>
            {#snippet metadata()}
              <MessageMetadata timestamp="Now" status="sent" />
            {/snippet}
          </Message>
        {/if}
      </MessageList>
    </Layout>
  {/if}
</AppShell.Sidebar.Body>
