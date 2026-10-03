<script lang="ts">
  import NotificationToasts from "./NotificationToasts.svelte";
  import * as Dialog from "../../../shadcn/dialog/index.js";
  import { Button } from "../../../shadcn/button/index.js";
  let open = $state(false);
  let action = $state("");
  let paused = $state(false);
  let records = $state([
    {
      id: "info",
      title: "Saved",
      message: "The settings were saved.",
      severity: "info" as const,
    },
    {
      id: "warning",
      title: "Connection interrupted",
      message: "Existing content remains available.",
      severity: "warning" as const,
    },
    {
      id: "error",
      title: "Request failed",
      message: "Try the request again.",
      severity: "error" as const,
      action: { id: "retry", label: "Retry request" },
    },
  ]);
</script>

<Button onclick={() => (open = true)}>Open notification dialog</Button>
<p>Action: {action || "none"}</p>
<p>Timer: {paused ? "paused" : "running"}</p>
<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Notification test</Dialog.Title>
      <Dialog.Description
        >Notifications remain available while this dialog is open.</Dialog.Description
      >
    </Dialog.Header>
    <Button onclick={() => (open = false)}>Finish</Button>
  </Dialog.Content>
</Dialog.Root>
<NotificationToasts
  {records}
  portal
  onDismiss={(id) => (records = records.filter((record) => record.id !== id))}
  onAction={(id, actionId) => (action = `${id}:${actionId}`)}
  onPause={() => (paused = true)}
  onResume={() => (paused = false)}
/>
