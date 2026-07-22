<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/button.md for the @stevejuma/ui native-CSS catalog. -->

# Button

Displays a button or a component that looks like a button.

**Updated:** We have updated the button component to add new sizes: `icon-sm` and `icon-lg`. See the
[changelog](/docs/components/button#changelog) for more details. Follow the
instructions to update your project.

## Installation

```bash
pnpm ui:add button
```

## Usage

```html
<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Button variant="outline">Button</Button>
```

## Examples

### Size


```html
<script lang="ts">
	import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<div class="flex flex-col items-start gap-8 sm:flex-row">
	<div class="flex items-start gap-2">
		<Button size="sm" variant="outline">Small</Button>
		<Button size="icon-sm" aria-label="Submit" variant="outline">
			<ArrowUpRightIcon />
		</Button>
	</div>
	<div class="flex items-start gap-2">
		<Button variant="outline">Default</Button>
		<Button size="icon" aria-label="Submit" variant="outline">
			<ArrowUpRightIcon />
		</Button>
	</div>
	<div class="flex items-start gap-2">
		<Button variant="outline" size="lg">Large</Button>
		<Button size="icon-lg" aria-label="Submit" variant="outline">
			<ArrowUpRightIcon />
		</Button>
	</div>
</div>
```

### Default


```html
<script lang="ts">
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Button>Button</Button>
```

### Outline


```html
<script lang="ts">
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Button variant="outline">Outline</Button>
```

### Secondary


```html
<script lang="ts">
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Button variant="secondary">Secondary</Button>
```

### Ghost


```html
<script lang="ts">
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Button variant="ghost">Ghost</Button>
```

### Destructive


```html
<script lang="ts">
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Button variant="destructive">Destructive</Button>
```

### Link


```html
<script lang="ts">
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Button variant="link">Link</Button>
```

### Icon


```html
<script lang="ts">
	import CircleFadingArrowUpIcon from "@lucide/svelte/icons/circle-fading-arrow-up";
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Button variant="outline" size="icon" aria-label="Submit">
	<CircleFadingArrowUpIcon />
</Button>
```

### With Icon

The spacing between the icon and the text is automatically adjusted based on the size of the button. You do not need any margin on the icon.

```html
<script lang="ts">
	import IconGitBranch from "@lucide/svelte/icons/git-branch";
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Button variant="outline" size="sm">
	<IconGitBranch /> New Branch
</Button>
```

### Rounded

Use the `rounded-full` class to make the button rounded.

```html
<script lang="ts">
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<div class="flex flex-col gap-8">
	<Button variant="outline" size="icon" class="rounded-full">
		<ArrowUpIcon />
	</Button>
</div>
```

### Spinner

```html
<script lang="ts">
	import { Button } from "@stevejuma/ui/shadcn/button";
	import { Spinner } from "@stevejuma/ui/shadcn/spinner";
</script>

<Button size="sm" variant="outline" disabled>
	<Spinner />
	Submit
</Button>
```

### Button Group

To create a button group, use the `ButtonGroup` component. See the [Button Group](/docs/components/button-group) documentation for more details.

```html
<ButtonGroup.Root>
  <ButtonGroup.Root class="hidden sm:flex">
    <Button variant="outline" size="icon" aria-label="Go Back">
      <ArrowLeft />
    </Button>
  </ButtonGroup.Root>
  <ButtonGroup.Root>
    <Button variant="outline">Archive</Button>
    <Button variant="outline">Report</Button>
  </ButtonGroup.Root>
  <ButtonGroup.Root>
    <Button variant="outline">Snooze</Button>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="outline"
            size="icon"
            aria-label="More Options"
          >
            <MoreHorizontal />
          </Button>
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
              <DropdownMenu.RadioGroup bind:value={label}>
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
	import { Button } from "@stevejuma/ui/shadcn/button";
</script>

<Button variant="link">Link</Button>
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
