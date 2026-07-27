<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import * as Breadcrumb from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Navigation/Breadcrumb",
    component: Breadcrumb.Root,
    parameters: {
      docs: {
        description: {
          component: "Hierarchical navigation trail for nested locations.",
        },
      },
    },
  });
</script>

<Story
  name="Account path"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("breadcrumb")).toBeVisible();
    await expect(canvas.getByText("Expenses")).toBeVisible();
  }}
  tags={["visual-ready"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/breadcrumb/account-path-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#accounts">Accounts</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>Expenses</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  {/snippet}
</Story>
