<script lang="ts">
  import * as Tabs from "@stevejuma/ui/shadcn/tabs";

  export type ChartModeOption = {
    value: string;
    label: string;
  };

  let {
    value,
    options,
    ariaLabel = "Chart representation",
    onChange = () => {},
  }: {
    value: string;
    options: readonly ChartModeOption[];
    ariaLabel?: string;
    onChange?: (value: string) => void;
  } = $props();
</script>

<Tabs.Root
  {value}
  onValueChange={(next) => {
    if (next) onChange(next);
  }}
>
  <Tabs.List aria-label={ariaLabel}>
    {#each options as option (option.value)}
      <Tabs.Trigger value={option.value}>{option.label}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
