<script lang="ts">
  import FilePathInput from "./FilePathInput.svelte";
  let {
    manual = false,
    disabled = false,
    readonly = false,
    invalid = false,
    failure = false,
    delayed = false,
  }: {
    manual?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    invalid?: boolean;
    failure?: boolean;
    delayed?: boolean;
  } = $props();
  let value = $state("/models/original.gguf");
  let calls = $state(0);
  let resolve: ((path: string) => void) | undefined;
  async function browse() {
    calls++;
    if (failure) throw new Error("Unavailable chooser");
    if (delayed)
      return new Promise<string>((done) => {
        resolve = done;
      });
    return calls === 1 ? "/models/selected.gguf" : null;
  }
</script>

<div style="max-width:32rem">
  <FilePathInput
    id="model-file"
    label="Model file"
    bind:value
    {disabled}
    {readonly}
    {invalid}
    onBrowse={manual ? undefined : browse}
  />
  {#if delayed}<button onclick={() => resolve?.("/models/stale.gguf")}
      >Finish chooser</button
    >{/if}
  <output data-testid="path">{value}</output>
  <output data-testid="calls">{calls}</output>
</div>
