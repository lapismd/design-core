export const Basic = `<script lang="ts">
  import { Composer } from "@lapismd/design-core/ai/chat";
</script>

<Composer placeholder="Type a message…" onSubmit={() => {}} />`;

export const Attachments = `<script lang="ts">
  import { Composer, ComposerDrawer } from "@lapismd/design-core/ai/chat";
</script>

<Composer onSubmit={() => {}}>
  {#snippet drawer()}
    <ComposerDrawer count={2}>
      <span>feature-prd.docx</span>
      <span>2026-roadmap.pdf</span>
    </ComposerDrawer>
  {/snippet}
</Composer>`;

export const Flat = `<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Composer } from "@lapismd/design-core/ai/chat";
  import MicIcon from "@lucide/svelte/icons/mic";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
</script>

<Composer elevation="none" onSubmit={() => {}}>
  {#snippet footerActions()}
    <Button variant="ghost" size="sm">
      <SparklesIcon aria-hidden="true" />
      Auto
    </Button>
    <Button variant="ghost" size="sm">
      <SettingsIcon aria-hidden="true" />
      Settings
    </Button>
  {/snippet}
  {#snippet sendActions()}
    <Button variant="ghost" size="icon-sm" aria-label="Microphone">
      <MicIcon aria-hidden="true" />
    </Button>
  {/snippet}
</Composer>`;

export const FooterActions = `<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Composer } from "@lapismd/design-core/ai/chat";
  import MicIcon from "@lucide/svelte/icons/mic";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
</script>

<Composer onSubmit={() => {}}>
  {#snippet footerActions()}
    <Button variant="ghost" size="sm">
      <SparklesIcon aria-hidden="true" />
      Auto
    </Button>
    <Button variant="ghost" size="sm">
      <SettingsIcon aria-hidden="true" />
      Settings
    </Button>
  {/snippet}
  {#snippet sendActions()}
    <Button variant="ghost" size="icon-sm" aria-label="Microphone">
      <MicIcon aria-hidden="true" />
    </Button>
  {/snippet}
</Composer>`;

export const FullFeatured = `<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import {
    Composer,
    ComposerDrawer,
    ComposerInput,
  } from "@lapismd/design-core/ai/chat";
  import AtSignIcon from "@lucide/svelte/icons/at-sign";
  import MicIcon from "@lucide/svelte/icons/mic";
  import PaperclipIcon from "@lucide/svelte/icons/paperclip";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";

  let streaming = $state(false);
</script>

<Composer
  placeholder="Ask me anything..."
  isStopShown={streaming}
  onSubmit={() => {
    streaming = true;
  }}
  onStop={() => {
    streaming = false;
  }}
>
  {#snippet drawer()}
    <ComposerDrawer count={2}>
      <span>design-spec.pdf</span>
      <span>requirements.docx</span>
    </ComposerDrawer>
  {/snippet}
  {#snippet headerActions()}
    <Button variant="ghost" size="icon-sm" aria-label="Mention">
      <AtSignIcon aria-hidden="true" />
    </Button>
    <Button variant="ghost" size="icon-sm" aria-label="Attach file">
      <PaperclipIcon aria-hidden="true" />
    </Button>
  {/snippet}
  {#snippet input()}
    <ComposerInput style="min-height: 2.75rem" />
  {/snippet}
  {#snippet footerActions()}
    <Button variant="ghost" size="sm">
      <SparklesIcon aria-hidden="true" />
      Auto
    </Button>
    <Button variant="ghost" size="sm">
      <SettingsIcon aria-hidden="true" />
      Settings
    </Button>
  {/snippet}
  {#snippet sendActions()}
    <Button variant="ghost" size="icon-sm" aria-label="Microphone">
      <MicIcon aria-hidden="true" />
    </Button>
  {/snippet}
</Composer>`;

export const Simple = Basic;

export const Streaming = `<script lang="ts">
  import { Composer } from "@lapismd/design-core/ai/chat";

  let streaming = $state(true);
</script>

<Composer
  isStopShown={streaming}
  onSubmit={() => {
    streaming = true;
  }}
  onStop={() => {
    streaming = false;
  }}
/>`;

export const Validation = `<script lang="ts">
  import { Composer } from "@lapismd/design-core/ai/chat";
</script>

<Composer
  statusPosition="top"
  status={{
    type: "error",
    message: "Failed to send message. Please try again.",
  }}
  onSubmit={() => {}}
/>`;
