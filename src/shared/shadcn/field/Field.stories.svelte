<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as Field from "./index.js";
  import { Input } from "../input/index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Field",
    component: Field.Field,
    parameters: {
      docs: {
        description: {
          component:
            "Form field composition primitives. Prefer FieldGroup + Field over ad-hoc label/control stacks."}}}});
</script>

<script lang="ts">
  let email = $state("");
</script>

<Story
  name="Labeled input with description"
  play={async ({ canvas }) => {
    await userEvent.type(canvas.getByLabelText("Work email"), "dev@ju.ma");
    await expect(canvas.getByRole("status")).toHaveTextContent("dev@ju.ma");
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/field/labeled-input-with-description-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
>
  {#snippet template()}
    <Field.FieldGroup class="max-w-sm">
      <Field.Field>
        <Field.FieldLabel for="catalog-work-email">Work email</Field.FieldLabel>
        <Input id="catalog-work-email" bind:value={email} />
        <Field.FieldDescription
          >Used for account notifications.</Field.FieldDescription
        >
      </Field.Field>
      <output class="text-muted-foreground text-sm">{email || "empty"}</output>
    </Field.FieldGroup>
  {/snippet}
</Story>
