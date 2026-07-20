<script lang="ts">
  let {
    label,
    value = "",
    showLabel = true,
    onChange,
  }: {
    label: string;
    value?: string;
    showLabel?: boolean;
    onChange: (value: string) => void;
  } = $props();
</script>

<label class="flex min-w-0 flex-col gap-1">
  {#if showLabel}
    <span class="text-muted-foreground text-xs font-medium">{label}</span>
  {/if}
  <input
    class="w-full border-0 bg-transparent px-0 py-0.5 text-sm outline-none"
    aria-label={label}
    {value}
    oninput={(event) => onChange(event.currentTarget.value)}
  />
</label>
