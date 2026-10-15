<script lang="ts">
  import { AvatarPicker } from "./index.js";
  import { Button } from "../../shadcn/button/index.js";
  let {
    upload = "local",
    disabled = false,
  }: { upload?: "local" | "controlled"; disabled?: boolean } = $props();
  let value = $state("");
  let queue = $state<
    {
      name: string;
      resolve: (value: string) => void;
      reject: (reason: Error) => void;
    }[]
  >([]);
  function uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      queue = [...queue, { name: file.name, resolve, reject }];
    });
  }
  function complete(): void {
    const next = queue[0];
    if (!next) return;
    queue = queue.slice(1);
    next.resolve(`https://example.test/${next.name}`);
  }
  function fail(): void {
    const next = queue.at(-1);
    if (!next) return;
    queue = queue.slice(0, -1);
    next.reject(new Error("Upload failed. Try another image."));
  }
</script>

<AvatarPicker
  bind:value
  name="Alex Morgan"
  {disabled}
  onUploadImage={upload === "controlled" ? uploadImage : undefined}
/>
<output
  data-testid="avatar-value"
  style="display:block;max-width:32rem;overflow-wrap:anywhere"
  >{value.startsWith("data:")
    ? `${value.slice(0, 42)}…`
    : value || "No avatar selected"}</output
>
{#if upload === "controlled"}<Button
    variant="outline"
    disabled={!queue.length}
    onclick={complete}>Complete oldest upload</Button
  ><Button variant="outline" disabled={!queue.length} onclick={fail}
    >Fail latest upload</Button
  >{/if}
