<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as CommandView from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Command View",
    component: CommandView.Root,
    tags: ["visual-pending", "!autodocs"],
  });
</script>

<script lang="ts">
  let selected = $state("none");
  let copied = $state("none");
  let profile = $state("none");
  const people = ["Ada", "Grace"];
</script>

<Story
  name="Interactive grid rows"
  play={async ({ canvas }) => {
    const grid = canvas.getByRole("grid", { name: "People" });
    await expect(grid).toBeVisible();
    await expect(canvas.getAllByRole("row")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: "Copy Ada" }));
    await expect(canvas.getByLabelText("Copied")).toHaveTextContent("Ada");
    await expect(canvas.getByLabelText("Selected")).toHaveTextContent("none");
    await userEvent.click(canvas.getByRole("button", { name: "About Ada" }));
    await expect(canvas.getByLabelText("Profile")).toHaveTextContent("Ada");
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByLabelText("Selected")).toHaveTextContent("Grace");
    await userEvent.type(input, "Ada");
    await expect(canvas.getAllByRole("row")).toHaveLength(1);
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Selected")).toHaveTextContent("Ada");
  }}
>
  {#snippet template()}
    <CommandView.Root label="Choose person">
      <CommandView.Input aria-haspopup="grid" placeholder="Find person" />
      <CommandView.List role="grid" aria-label="People">
        <CommandView.Group role="rowgroup">
          {#each people as person}
            <CommandView.Item
              role="row"
              value={person}
              onSelect={() => (selected = person)}
            >
              <span role="gridcell">{person}</span>
              <span role="gridcell">
                <Button
                  size="xs"
                  aria-label={`Copy ${person}`}
                  onclick={(event) => {
                    event.stopPropagation();
                    copied = person;
                  }}>Copy</Button
                >
                <Button
                  size="xs"
                  aria-label={`About ${person}`}
                  onclick={(event) => {
                    event.stopPropagation();
                    profile = person;
                  }}>About</Button
                >
              </span>
            </CommandView.Item>
          {/each}
        </CommandView.Group>
      </CommandView.List>
    </CommandView.Root>
    <output aria-label="Selected">{selected}</output>
    <output aria-label="Copied">{copied}</output>
    <output aria-label="Profile">{profile}</output>
  {/snippet}
</Story>

<Story
  name="Custom child roles"
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("grid")).toBeVisible();
    await expect(canvas.getByRole("rowgroup")).toBeVisible();
    await expect(canvas.getByRole("row")).toBeVisible();
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Selected")).toHaveTextContent("Ada");
  }}
>
  {#snippet template()}
    <CommandView.Root label="Custom person">
      <CommandView.Input aria-haspopup="grid" placeholder="Find person" />
      <CommandView.List role="grid">
        <CommandView.Group role="rowgroup">
          {#snippet child({ props })}
            <div {...props}>
              <CommandView.Item
                role="row"
                value="Ada"
                onSelect={() => (selected = "Ada")}
              >
                {#snippet child({ props })}
                  <div {...props}><span role="gridcell">Ada</span></div>
                {/snippet}
              </CommandView.Item>
            </div>
          {/snippet}
        </CommandView.Group>
      </CommandView.List>
    </CommandView.Root>
    <output aria-label="Selected">{selected}</output>
  {/snippet}
</Story>
