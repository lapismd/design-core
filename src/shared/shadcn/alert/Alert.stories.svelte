<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import * as Alert from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Feedback/Alert",
    component: Alert.Root,
    parameters: {
      docs: {
        description: {
          component: "Inline callout for status messages and warnings."}}}});
</script>

<Story
  name="Informational callout"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Sync complete")).toBeVisible();
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/alert/informational-callout-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
>
  {#snippet template()}
    <Alert.Root class="max-w-md">
      <Alert.Title>Sync complete</Alert.Title>
      <Alert.Description>Your workspace finished updating.</Alert.Description>
    </Alert.Root>
  {/snippet}
</Story>
