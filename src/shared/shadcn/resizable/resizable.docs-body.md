## About

The `Resizable` component is built on top of [PaneForge](https://github.com/svecosystem/paneforge) by [Huntabyte](https://github.com/huntabyte). Visit the [PaneForge documentation](https://paneforge.com) for all the available props and abilities of the `Resizable` component.

## Installation

```bash
pnpm ui:add resizable
```

## Usage

```html
<script lang="ts">
  import * as Resizable from "@lapismd/design-core/shadcn/resizable";
</script>
```

```html
<Resizable.PaneGroup direction="horizontal">
  <Resizable.Pane>One</Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane>Two</Resizable.Pane>
</Resizable.PaneGroup>
```

## Examples

### Vertical

Use the `direction` prop to set the direction of the resizable panels.

```html
<script lang="ts">
  import * as Resizable from "@lapismd/design-core/shadcn/resizable";
</script>

<Resizable.PaneGroup
  direction="vertical"
  class="min-h-[200px] max-w-md rounded-lg border"
>
  <Resizable.Pane defaultSize="{25}">
    <div class="flex h-full items-center justify-center p-6">
      <span class="font-semibold">Header</span>
    </div>
  </Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane defaultSize="{75}">
    <div class="flex h-full items-center justify-center p-6">
      <span class="font-semibold">Content</span>
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>
```

### Handle

You can set or hide the handle by using the `withHandle` prop on the `ResizableHandle` component.
Use `variant="prominent"` for a thicker separator and a larger drag thumb in dense split workspaces.

```html
<script lang="ts">
  import * as Resizable from "@lapismd/design-core/shadcn/resizable";
</script>

<Resizable.PaneGroup
  direction="horizontal"
  class="min-h-[200px] max-w-md rounded-lg border"
>
  <Resizable.Pane defaultSize="{25}">
    <div class="flex h-full items-center justify-center p-6">
      <span class="font-semibold">Sidebar</span>
    </div>
  </Resizable.Pane>
  <Resizable.Handle withHandle variant="prominent" />
  <Resizable.Pane defaultSize="{75}">
    <div class="flex h-full items-center justify-center p-6">
      <span class="font-semibold">Content</span>
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>
```
