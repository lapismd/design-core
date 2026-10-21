export const Basic = `<script lang="ts">
  import { AvatarPicker } from "@lapismd/design-core/forms";
  let value = $state("");
</script>
<AvatarPicker bind:value name="Alex Morgan" shape="rounded" size="2xl" presentation="popover" />`;
export const Upload = `<script lang="ts">
  import { AvatarPicker } from "@lapismd/design-core/forms";
  let value = $state("");
  async function upload(file: File, signal: AbortSignal): Promise<string> {
    const body = new FormData(); body.set("image", file);
    const response = await fetch("/api/avatar", { method: "POST", body, signal });
    if (!response.ok) throw new Error("Upload failed. Try again.");
    return (await response.json()).url;
  }
</script>
<AvatarPicker bind:value name="Alex Morgan" onUploadImage={upload} />`;

export const Inline = `<script lang="ts">
  import { AvatarPicker } from "@lapismd/design-core/forms/avatar-picker";
  let value = $state("");
  let open = $state(true);
</script>
<AvatarPicker bind:value bind:open presentation="inline" name="Alex Morgan" shape="rounded" size="2xl" />`;

export const Styles = `<script lang="ts">
  import { AvatarPicker } from "@lapismd/design-core/forms/avatar-picker";
  let value = $state("/profile.webp");
</script>
<AvatarPicker bind:value shape="circle" size="lg" name="Alex Morgan" />
<AvatarPicker bind:value shape="rounded" size="xl" name="Alex Morgan" />
<AvatarPicker bind:value shape="rounded" size="2xl" name="Alex Morgan" />
<!-- Inherit --ui-avatar-picker-size for an exact size; use --ui-avatar-radius for corner rounding. -->`;

export const TransparentImage = `<script lang="ts">
  import { AvatarPicker } from "@lapismd/design-core/forms/avatar-picker";
  let value = $state("/transparent-avatar.png");
  let background = $state("#fef3c7");
</script>
<AvatarPicker bind:value bind:background presentation="inline" open shape="rounded" size="2xl" name="Profile" />`;

export const InitialsLabel = `<script lang="ts">
  import { AvatarPicker } from "@lapismd/design-core/forms/avatar-picker";
</script>
<AvatarPicker name="Saved Agent" label="Edit agent avatar" background="#6e56cf" />`;
