<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { visualCapture } from "../../../storybook/visual-capture";
  import AddSectionChooser from "./AddSectionChooser.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Layout/Add Section Chooser",
    component: AddSectionChooser,
    parameters: {
      docs: {
        description: {
          component:
            "Chooser for adding a section type from a prop-driven list.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let open = $state(false);
  let title = $state("");
  let chosen = $state("none");
</script>

<Story
  name="Chooses a section"
  play={async ({ canvas, step }) => {
    await visualCapture(step, "Opens chooser", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Add New Section" }),
      );
      await expect(
        canvas.getByRole("button", { name: "Projects" }),
      ).toBeVisible();
    });
    await visualCapture(step, "Chooses Projects", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Projects" }));
      await expect(canvas.getByRole("status")).toHaveTextContent("projects");
    });
  }}
  parameters={{
    visualDelta: {"images":["/visual-baselines/forms/add-section-chooser/chooses-a-section-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1,"interactions":[{"id":"chooses-projects","label":"Chooses Projects","src":"/visual-baselines/forms/add-section-chooser/chooses-a-section--chooses-projects-chromium-darwin.png"},{"id":"opens-chooser","label":"Opens chooser","src":"/visual-baselines/forms/add-section-chooser/chooses-a-section--opens-chooser-chromium-darwin.png"}]},
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="flex flex-col gap-2">
      <AddSectionChooser
        {open}
        {title}
        options={[
          { value: "experience", label: "Experience" },
          { value: "projects", label: "Projects" },
        ]}
        onOpen={() => {
          open = true;
        }}
        onCancel={() => {
          open = false;
        }}
        onTitleChange={(next) => {
          title = next;
        }}
        onChoose={(value) => {
          chosen = value;
          open = false;
        }}
      />
      <output class="text-muted-foreground text-sm">{chosen}</output>
    </div>
  {/snippet}
</Story>
