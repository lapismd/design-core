<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import SortableArrayItem from "./SortableArrayItem.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/List Editor",
    component: SortableArrayItem,
    tags: ["!autodocs"],
    parameters: {
      docs: {
        source: {
          language: "tsx",
          type: "code",
          code: `<SortableArrayItem
  id={item.id}
  index={index}
  onDragStart={startDrag}
  onKeyboardMove={moveItem}
>
  {item.label}
</SortableArrayItem>`,
        },
      },
    },
  });
</script>

<script lang="ts">
  let items = $state(["First", "Second"]);

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    if (item) next.splice(target, 0, item);
    items = next;
  }
</script>

<Story
  name="Keyboard reordering"
  tags={["visual-pending", "test"]}
  play={async ({ canvas }) => {
    const secondHandle = canvas.getByRole("button", { name: "Move Second" });
    secondHandle.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("status")).toHaveTextContent("Second,First");
  }}
>
  {#snippet template()}
    <div style="width: 18rem; padding: 1rem;">
      {#each items as item, index (item)}
        <SortableArrayItem
          id={item}
          {index}
          dragLabel={`Move ${item}`}
          canMoveUp={index > 0}
          canMoveDown={index < items.length - 1}
          onDragStart={() => {}}
          onKeyboardMove={move}
          onRemove={() => {}}
        >
          <span>{item}</span>
        </SortableArrayItem>
      {/each}
      <output>{items.join(",")}</output>
    </div>
  {/snippet}
</Story>
