<script lang="ts">
  import { ComposerInput, ToolCalls } from "@lapismd/design-core/ai/chat";
  import { ReactionBar } from "@lapismd/design-core/ai/experimental";
  import {
    PowerSearch,
    createDemoLedgerFilterSyntax,
    type PowerSearchToken,
  } from "@lapismd/design-core/filter";
  import * as DropdownMenu from "@lapismd/design-core/shadcn/dropdown-menu";
  import { Spinner } from "@lapismd/design-core/shadcn/spinner";

  let filter = $state("all");
  let tokens = $state<PowerSearchToken[]>([]);
  const filterSyntax = createDemoLedgerFilterSyntax();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>Filter</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.RadioGroup bind:value={filter}>
      <DropdownMenu.RadioItem value="all">All</DropdownMenu.RadioItem>
    </DropdownMenu.RadioGroup>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<Spinner />
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
