## Installation

```bash
pnpm ui:add button
```

## Usage

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<button variant="outline">Button</button>
```

## Examples

### Size

```html
<script lang="ts">
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<div class="flex flex-col items-start gap-8 sm:flex-row">
  <div class="flex items-start gap-2">
    <button size="sm" variant="outline">Small</button>
    <button size="icon-sm" aria-label="Submit" variant="outline">
      <ArrowUpRightIcon />
    </button>
  </div>
  <div class="flex items-start gap-2">
    <button variant="outline">Default</button>
    <button size="icon" aria-label="Submit" variant="outline">
      <ArrowUpRightIcon />
    </button>
  </div>
  <div class="flex items-start gap-2">
    <button variant="outline" size="lg">Large</button>
    <button size="icon-lg" aria-label="Submit" variant="outline">
      <ArrowUpRightIcon />
    </button>
  </div>
</div>
```

### Default

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<button>Button</button>
```

### Outline

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<button variant="outline">Outline</button>
```

### Secondary

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<button variant="secondary">Secondary</button>
```

### Ghost

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<button variant="ghost">Ghost</button>
```

### Destructive

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<button variant="destructive">Destructive</button>
```

### Link

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<button variant="link">Link</button>
```

### Icon

```html
<script lang="ts">
  import CircleFadingArrowUpIcon from "@lucide/svelte/icons/circle-fading-arrow-up";
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<button variant="outline" size="icon" aria-label="Submit">
  <CircleFadingArrowUpIcon />
</button>
```

### With Icon

The spacing between the icon and the text is automatically adjusted based on the size of the button. You do not need any margin on the icon.

```html
<script lang="ts">
  import IconGitBranch from "@lucide/svelte/icons/git-branch";
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<button variant="outline" size="sm"><IconGitBranch /> New Branch</button>
```

### Rounded

Use the `rounded-full` class to make the button rounded.

```html
<script lang="ts">
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<div class="flex flex-col gap-8">
  <button variant="outline" size="icon" class="rounded-full">
    <ArrowUpIcon />
  </button>
</div>
```

### Spinner

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Spinner } from "@lapismd/design-core/shadcn/spinner";
</script>

<button size="sm" variant="outline" disabled>
  <Spinner />
  Submit
</button>
```

### Button Group

To create a button group, use the `ButtonGroup` component. See the [Button Group](/docs/components/button-group) documentation for more details.

```html
<ButtonGroup.Root>
  <ButtonGroup.Root class="hidden sm:flex">
    <button variant="outline" size="icon" aria-label="Go Back">
      <ArrowLeft />
    </button>
  </ButtonGroup.Root>
  <ButtonGroup.Root>
    <button variant="outline">Archive</button>
    <button variant="outline">Report</button>
  </ButtonGroup.Root>
  <ButtonGroup.Root>
    <button variant="outline">Snooze</button>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
        <button
          {...props}
          variant="outline"
          size="icon"
          aria-label="More Options"
        >
          <MoreHorizontal />
        </button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" class="w-52">
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            <MailCheck />
            Mark as Read
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <Archive />
            Archive
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            <Clock />
            Snooze
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <CalendarPlus />
            Add to Calendar
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <ListFilter />
            Add to List
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
              <Tag />
              Label As...
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.RadioGroup bind:value="{label}">
                <DropdownMenu.RadioItem value="personal">
                  Personal
                </DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="work"
                  >Work</DropdownMenu.RadioItem
                >
                <DropdownMenu.RadioItem value="other"
                  >Other</DropdownMenu.RadioItem
                >
              </DropdownMenu.RadioGroup>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item class="text-destructive focus:text-destructive">
            <Trash2 />
            Trash
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </ButtonGroup.Root>
</ButtonGroup.Root>
```

### Link

You can convert the `<button>` into an `<a>` element by simply passing an `href` as a prop.

Alternatively, you can use the `buttonVariants` helper to create a link that looks like a button.

```html
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<button variant="link">Link</button>
```

## Changelog

### 2025-09-24 New sizes

We have added two new sizes to the button component: `icon-sm` and `icon-lg`. These sizes are used to create icon buttons. To add them, edit `button.svelte` and add the following code under `size` in `buttonVariants`:

```typescript
export const buttonVariants = tv({
  // ...
  variants: {
    // ...
    size: {
      // ...
      icon: "size-9",
      "icon-sm": "size-8",
      "icon-lg": "size-10",
    },
  },
});
```
