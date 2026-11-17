<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import CheckIcon from "@lucide/svelte/icons/check";
  import * as Alert from "./index.js";
  import { DestructiveDescription } from "./Alert.contrast-example-sources.js";

  const { Story } = defineMeta({
    title: "Shadcn/Feedback/Alert",
    component: Alert.Root,
    parameters: {
      docs: {
        description: {
          component: "Inline callout for status messages and warnings.",
        },
      },
    },
  });
</script>

<Story
  name="Informational callout"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Sync complete")).toBeVisible();
  }}
  tags={["visual-pending"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/alert/informational-callout-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <Alert.Root class="max-w-md">
      <Alert.Title>Sync complete</Alert.Title>
      <Alert.Description>Your workspace finished updating.</Alert.Description>
    </Alert.Root>
  {/snippet}
</Story>

<Story
  name="Icon content alignment"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByText("Changes saved")).gridColumnStart,
    ).toBe("2");
  }}
>
  {#snippet template()}
    <Alert.Root
      ><CheckIcon /><Alert.Title>Changes saved</Alert.Title><Alert.Description
        >Your changes are ready.</Alert.Description
      ></Alert.Root
    >
  {/snippet}
</Story>

<Story
  name="Destructive description in light mode"
  tags={["visual-pending"]}
  globals={{ colorMode: "light" }}
  parameters={{
    docs: {
      source: { code: DestructiveDescription, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveAttribute(
      "data-variant",
      "destructive",
    );
    await expect(
      canvas.getByText(
        "Your prompt was not sent. Retain the draft and try again.",
      ),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <Alert.Root variant="destructive">
      <Alert.Title>Request refused</Alert.Title>
      <Alert.Description
        >Your prompt was not sent. Retain the draft and try again.</Alert.Description
      >
    </Alert.Root>
  {/snippet}
</Story>

<Story
  name="Destructive description in dark mode"
  tags={["visual-pending"]}
  globals={{ colorMode: "dark" }}
  parameters={{
    docs: {
      source: { code: DestructiveDescription, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveAttribute(
      "data-variant",
      "destructive",
    );
    await expect(
      canvas.getByText(
        "Your prompt was not sent. Retain the draft and try again.",
      ),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <Alert.Root variant="destructive">
      <Alert.Title>Request refused</Alert.Title>
      <Alert.Description
        >Your prompt was not sent. Retain the draft and try again.</Alert.Description
      >
    </Alert.Root>
  {/snippet}
</Story>
