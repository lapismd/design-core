<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/drawer.md for the @lapismd/design-core native-CSS catalog. -->

# Drawer

A drawer component for Svelte.

## About

Drawer is built on top of [Vaul Svelte](https://vaul-svelte.com), which is a Svelte port of [Vaul](https://vaul.emilkowal.ski) by [Emil Kowalski](https://twitter.com/emilkowalski_).

## Installation

```bash
pnpm ui:add drawer
```

## Usage

```html
<script lang="ts">
  import * as Drawer from "@lapismd/design-core/shadcn/drawer";
</script>
```

```html
<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Are you sure absolutely sure?</Drawer.Title>
      <Drawer.Description>This action cannot be undone.</Drawer.Description>
    </Drawer.Header>
    <Drawer.Footer>
      <Button>Submit</Button>
      <Drawer.Close>Cancel</Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
```

## Examples

### Sides

Use the `direction` prop to set the side of the drawer. Available options are `top`, `right`, `bottom`, and `left`.

```html
<script lang="ts">
  import * as Drawer from "@lapismd/design-core/shadcn/drawer";
  import { Button, buttonVariants } from "@lapismd/design-core/shadcn/button";
  import { cn } from "../../../../lib/utils.js";

  const DRAWER_SIDES = ["top", "right", "bottom", "left"] as const;
</script>

<div class="flex flex-wrap gap-2">
  {#each DRAWER_SIDES as side (side)}
    <Drawer.Root direction={side === "bottom" ? undefined : side}>
      <Drawer.Trigger
        class={cn(buttonVariants({ variant: "outline" }), "capitalize")}
      >
        {side}
      </Drawer.Trigger>
      <Drawer.Content
        class="data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]"
      >
        <Drawer.Header>
          <Drawer.Title>Move Goal</Drawer.Title>
          <Drawer.Description>Set your daily activity goal.</Drawer.Description>
        </Drawer.Header>
        <div class="no-scrollbar overflow-y-auto px-4">
          {#each Array.from({ length: 10 }) as _, i (i)}
            <p class="mb-4 leading-normal">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          {/each}
        </div>
        <Drawer.Footer>
          <Button>Submit</Button>
          <Drawer.Close class={buttonVariants({ variant: "outline" })}>
            Cancel
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  {/each}
</div>
```

### Responsive Dialog

You can combine the `Dialog` and `Drawer` components to create a responsive dialog. This renders a `Dialog` on desktop and a `Drawer` on mobile.
