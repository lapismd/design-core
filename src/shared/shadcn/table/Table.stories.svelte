<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import * as Table from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Data/Table",
    component: Table.Root,
    parameters: {
      docs: {
        description: {
          component: "Responsive data table with semantic native CSS parts.",
        },
      },
    },
  });
</script>

<Story
  name="Invoice rows"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("INV001")).toBeVisible();
    await expect(canvas.getByText("$250.00")).toBeVisible();
  }}
  tags={["visual-pending"]}

  parameters={{
    visualDelta: {"images":["/visual-baselines/shadcn/table/invoice-rows-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
  }}
>
  {#snippet template()}
    <Table.Root>
      <Table.Caption>A list of your recent invoices.</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-[100px]">Invoice</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Method</Table.Head>
          <Table.Head class="text-end">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell class="font-medium">INV001</Table.Cell>
          <Table.Cell>Paid</Table.Cell>
          <Table.Cell>Credit Card</Table.Cell>
          <Table.Cell class="text-end">$250.00</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  {/snippet}
</Story>
