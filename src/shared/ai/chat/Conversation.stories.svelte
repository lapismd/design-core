<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Composer from "./Composer.svelte";
  import Layout from "./Layout.svelte";
  import Message from "./Message.svelte";
  import MessageBubble from "./MessageBubble.svelte";
  import MessageList from "./MessageList.svelte";
  import MessageMetadata from "./MessageMetadata.svelte";
  import SystemMessage from "./SystemMessage.svelte";
  import ToolCalls from "./ToolCalls.svelte";
  import ReactionBar from "./experimental/ReactionBar.svelte";
  import Reasoning from "./experimental/Reasoning.svelte";
  import TypingIndicator from "./experimental/TypingIndicator.svelte";
  import UnreadDivider from "./experimental/UnreadDivider.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Conversation",
    component: Layout,
    parameters: {
      docs: {
        description: {
          component:
            "Complete host-controlled conversation composing stable and experimental AI Chat primitives.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let draft = $state("");
  let submitted = $state("");
</script>

<Story
  name="Complete AI conversation"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Message" });
    await userEvent.click(input);
    await userEvent.type(input, "Create the release summary");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByText("Create the release summary")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/conversation/complete-ai-conversation-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    {#snippet inspectDetail()}
      Checked the shared AI source and public package boundaries.
    {/snippet}
    <div data-story="conversation-frame">
      <Layout>
        {#snippet composer()}
          <div data-story="conversation-composer">
            <TypingIndicator names={["Ada"]} />
            <Composer
              bind:value={draft}
              onSubmit={(value) => {
                submitted = value;
              }}
            />
          </div>
        {/snippet}

        <MessageList latestMessageId={submitted || "assistant-2"}>
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
              The release adds reusable Svelte 5 Chat primitives while preserving
              the existing AI panel API.
            </MessageBubble>
            <ReactionBar
              reactions={[
                { emoji: "🎉", count: 3, selected: true },
                { emoji: "👀", count: 1 },
              ]}
            />
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
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="conversation-frame"]) {
    width: min(40rem, 92vw);
    height: 38rem;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 1rem;
    background: var(--background);
  }

  :global([data-story="conversation-composer"]) {
    display: grid;
    gap: 0.25rem;
  }
</style>
