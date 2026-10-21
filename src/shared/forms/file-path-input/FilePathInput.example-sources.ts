export const Basic = `<script lang="ts">
 import { FilePathInput } from "@lapismd/design-core/forms/file-path-input";
 let { chooseFile, reportError }: { chooseFile: () => Promise<string | null>; reportError: (error: unknown) => void } = $props();
 let path = $state("");
</script>
<FilePathInput id="model" label="Model file" bind:value={path} placeholder="/path/model.gguf" onBrowse={chooseFile} onBrowseError={reportError} />`;
