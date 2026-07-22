<script lang="ts">
  import "@stevejuma/ui/forms/FormControlRow.css";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import XIcon from "@lucide/svelte/icons/x";
  import {
    StructuredForm,
    createFormConfig,
    optionField,
    textField,
  } from "@stevejuma/ui/forms";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { SocialNetwork } from "../types";

  let {
    items = [],
    onChange,
  }: {
    items?: SocialNetwork[];
    onChange: (items: SocialNetwork[]) => void;
  } = $props();

  const networkOptions = [
    "LinkedIn",
    "GitHub",
    "GitLab",
    "IMDB",
    "Instagram",
    "ORCID",
    "Mastodon",
    "StackOverflow",
    "ResearchGate",
    "YouTube",
    "Google Scholar",
    "Telegram",
    "WhatsApp",
    "Leetcode",
    "X",
    "Bluesky",
    "Reddit",
  ].map((value) => ({ value, label: value }));

  const socialNetworkFormConfig = createFormConfig<SocialNetwork>({
    id: "cv-social-network",
    fields: [
      optionField({
        id: "network",
        label: "Network",
        ariaLabel: "Social network",
        presentation: "menu",
        options: networkOptions,
        get: (item) => item.network,
        set: (item, network) => ({ ...item, network }),
      }),
      textField({
        id: "username",
        label: "Username",
        get: (item) => item.username,
        set: (item, username) => ({ ...item, username }),
      }),
    ],
  });

  function add() {
    onChange([...items, { network: "LinkedIn", username: "" }]);
  }

  function update(index: number, value: SocialNetwork) {
    onChange(
      items.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  function remove(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }
</script>

<div class="cv-control-row-group gap-0" data-ui-part="social-networks-editor">
  <div class="cv-control-action-row">
    <span class="cv-control-action-row__label">Social Networks</span>
    <div class="cv-control-action-row__control">
      <Button
        type="button"
        variant="ghost"
        size="xs"
        class="text-muted-foreground hover:text-foreground h-5 gap-1 px-0 text-xs font-normal hover:bg-transparent [&_svg]:size-3"
        onclick={add}
      >
        <PlusIcon data-icon="inline-start" />
        Add
      </Button>
    </div>
  </div>

  <div class="col-span-full flex flex-col">
    {#each items as item, index (index)}
      <div class="group/social-network relative border-b last:border-b-0">
        <div class="pl-4">
          <StructuredForm
            value={item}
            config={socialNetworkFormConfig}
            onChange={(value) => update(index, value as SocialNetwork)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          class="text-muted-foreground/70 hover:text-foreground absolute top-1/2 -right-5 size-5 -translate-y-1/2 rounded-sm opacity-0 transition-opacity group-focus-within/social-network:opacity-100 group-hover/social-network:opacity-100 hover:bg-transparent focus-visible:opacity-100 [&_svg]:size-3.5"
          aria-label="Delete social network"
          onclick={() => remove(index)}
        >
          <XIcon />
        </Button>
      </div>
    {/each}
  </div>
</div>
