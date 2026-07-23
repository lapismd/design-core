<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/button-group.md for the @stevejuma/ui native-CSS catalog. -->

# Button Group

A container that groups related buttons together with consistent styling.

## Installation

```bash
pnpm ui:add button-group
```

## Usage

```html
<script lang="ts">
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
</script>
```

```html
<ButtonGroup.Root>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup.Root>
```

## Accessibility

- The `ButtonGroup` component has the `role` attribute set to `group`.
- Use `tabindex` to navigate between the buttons in the group.
- Use `aria-label` or `aria-labelledby` to label the button group.

```html
<ButtonGroup aria-label="Button group">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup>
```

## ButtonGroup vs ToggleGroup

- Use the `ButtonGroup` component when you want to group buttons that perform an action.
- Use the `ToggleGroup` component when you want to group buttons that toggle a state.

## Examples

### Orientation

Set the `orientation` prop to change the button group layout.

```html
<script lang="ts">
  import Minus from "@lucide/svelte/icons/minus";
  import Plus from "@lucide/svelte/icons/plus";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
</script>

<ButtonGroup.Root
  orientation="vertical"
  aria-label="Media controls"
  class="h-fit"
>
  <Button variant="outline" size="icon">
    <Plus />
  </Button>
  <Button variant="outline" size="icon">
    <Minus />
  </Button>
</ButtonGroup.Root>
```

### Size

Control the size of buttons using the `size` prop on individual buttons.

```html
<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
</script>

<div class="flex flex-col items-start gap-8">
  <ButtonGroup.Root>
    <Button variant="outline" size="sm">Small</Button>
    <Button variant="outline" size="sm">Button</Button>
    <Button variant="outline" size="sm">Group</Button>
    <Button variant="outline" size="icon-sm">
      <Plus />
    </Button>
  </ButtonGroup.Root>
  <ButtonGroup.Root>
    <Button variant="outline">Default</Button>
    <Button variant="outline">Button</Button>
    <Button variant="outline">Group</Button>
    <Button variant="outline" size="icon">
      <Plus />
    </Button>
  </ButtonGroup.Root>
  <ButtonGroup.Root>
    <Button variant="outline" size="lg">Large</Button>
    <Button variant="outline" size="lg">Button</Button>
    <Button variant="outline" size="lg">Group</Button>
    <Button variant="outline" size="icon-lg">
      <Plus />
    </Button>
  </ButtonGroup.Root>
</div>
```

### Nested

Nest `ButtonGroup` components to create button groups with spacing.

```html
<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
</script>

<ButtonGroup.Root>
  <ButtonGroup.Root>
    <Button variant="outline" size="sm">1</Button>
    <Button variant="outline" size="sm">2</Button>
    <Button variant="outline" size="sm">3</Button>
    <Button variant="outline" size="sm">4</Button>
    <Button variant="outline" size="sm">5</Button>
  </ButtonGroup.Root>
  <ButtonGroup.Root>
    <Button variant="outline" size="icon-sm" aria-label="Previous">
      <ArrowLeft />
    </Button>
    <Button variant="outline" size="icon-sm" aria-label="Next">
      <ArrowRight />
    </Button>
  </ButtonGroup.Root>
</ButtonGroup.Root>
```

### Separator

The `ButtonGroupSeparator` component visually divides buttons within a group.

Buttons with variant `outline` do not need a separator since they have a border. For other variants, a separator is recommended to improve the visual hierarchy.

```html
<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
</script>

<ButtonGroup.Root>
  <Button variant="secondary" size="sm">Copy</Button>
  <ButtonGroup.Separator />
  <Button variant="secondary" size="sm">Paste</Button>
</ButtonGroup.Root>
```

### Split

Create a split button group by adding two buttons separated by a `ButtonGroupSeparator`.

```html
<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
</script>

<ButtonGroup.Root>
  <Button variant="secondary">Button</Button>
  <ButtonGroup.Separator />
  <Button variant="secondary" size="icon">
    <Plus />
  </Button>
</ButtonGroup.Root>
```

### Input

Wrap an `Input` component with buttons.

```html
<script lang="ts">
  import Search from "@lucide/svelte/icons/search";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
  import { Input } from "@stevejuma/ui/shadcn/input";
</script>

<ButtonGroup.Root>
  <Input placeholder="Search..." />
  <Button variant="outline" size="icon" aria-label="Search">
    <Search />
  </Button>
</ButtonGroup.Root>
```

### Input Group

Wrap an `InputGroup` component to create complex input layouts.

```html
<script lang="ts">
  import AudioLines from "@lucide/svelte/icons/audio-lines";
  import Plus from "@lucide/svelte/icons/plus";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";

  let voiceEnabled = $state(false);
</script>

<Tooltip.Provider delayDuration={0}>
<ButtonGroup.Root class="[--radius:9999rem]">
  <ButtonGroup.Root>
    <Button variant="outline" size="icon">
      <Plus />
    </Button>
  </ButtonGroup.Root>
  <ButtonGroup.Root class="flex-1">
    <InputGroup.Root>
      <InputGroup.Input
        placeholder={voiceEnabled
          ? "Record and send audio..."
          : "Send a message..."}
        disabled={voiceEnabled}
      />
      <InputGroup.Addon align="inline-end">
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <InputGroup.Button
                {...props}
                onclick={() => (voiceEnabled = !voiceEnabled)}
                size="icon-xs"
                data-active={voiceEnabled}
                class="data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100"
                aria-pressed={voiceEnabled}
              >
                <AudioLines />
              </InputGroup.Button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>Voice Mode</Tooltip.Content>
        </Tooltip.Root>
      </InputGroup.Addon>
    </InputGroup.Root>
  </ButtonGroup.Root>
</ButtonGroup.Root>
</Tooltip.Provider>
```

### Dropdown Menu

Create a split button group with a `DropdownMenu` component.

```html
<script lang="ts">
  import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import CopyIcon from "@lucide/svelte/icons/copy";
  import CheckIcon from "@lucide/svelte/icons/check";
  import Share from "@lucide/svelte/icons/share";
  import Trash from "@lucide/svelte/icons/trash";
  import UserRoundX from "@lucide/svelte/icons/user-round-x";
  import VolumeOff from "@lucide/svelte/icons/volume-off";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
</script>

<ButtonGroup.Root>
  <Button variant="outline">Follow</Button>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="outline" class="!ps-2">
          <ChevronDown />
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end" class="[--radius:1rem]">
      <DropdownMenu.Group>
        <DropdownMenu.Item>
          <VolumeOff />
          Mute Conversation
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <CheckIcon />
          Mark as Read
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <AlertTriangle />
          Report Conversation
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <UserRoundX />
          Block User
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Share />
          Share Conversation
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <CopyIcon />
          Copy Conversation
        </DropdownMenu.Item>
      </DropdownMenu.Group>
      <DropdownMenu.Separator />
      <DropdownMenu.Group>
        <DropdownMenu.Item variant="destructive">
          <Trash />
          Delete Conversation
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</ButtonGroup.Root>
```

### Select

Pair with a `Select` component.

```html
<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
  import { Input } from "@stevejuma/ui/shadcn/input";
  import * as Select from "@stevejuma/ui/shadcn/select";

  const CURRENCIES = [
    {
      value: "$",
      label: "US Dollar",
    },
    {
      value: "€",
      label: "Euro",
    },
    {
      value: "£",
      label: "British Pound",
    },
  ];

  let currency = $state("$");
</script>

<ButtonGroup.Root>
  <ButtonGroup.Root>
    <Select.Root type="single" bind:value={currency}>
      <Select.Trigger class="font-mono">
        {currency}
      </Select.Trigger>
      <Select.Content class="min-w-24">
        {#each CURRENCIES as currencyOption (currencyOption.value)}
          <Select.Item value={currencyOption.value}>
            {currencyOption.value}
            <span class="text-muted-foreground">{currencyOption.label}</span>
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
    <Input placeholder="10.00" pattern="[0-9]*" />
  </ButtonGroup.Root>
  <ButtonGroup.Root>
    <Button aria-label="Send" size="icon" variant="outline">
      <ArrowRight />
    </Button>
  </ButtonGroup.Root>
</ButtonGroup.Root>
```

### Popover

Use with a `Popover` component.

```html
<script lang="ts">
  import Bot from "@lucide/svelte/icons/bot";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ButtonGroup from "@stevejuma/ui/shadcn/button-group";
  import * as Popover from "@stevejuma/ui/shadcn/popover";
  import { Separator } from "@stevejuma/ui/shadcn/separator";
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<ButtonGroup.Root>
  <Button variant="outline" size="sm">
    <Bot />
    Copilot
  </Button>
  <Popover.Root>
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="outline"
          size="icon-sm"
          aria-label="Open Popover"
        >
          <ChevronDown />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content align="end" class="rounded-xl p-0 text-sm">
      <div class="px-4 py-3">
        <div class="text-sm font-medium">Agent Tasks</div>
      </div>
      <Separator />
      <div class="p-4 text-sm *:[p:not(:last-child)]:mb-2">
        <Textarea
          placeholder="Describe your task in natural language."
          class="mb-4 resize-none"
        />
        <p class="font-medium">Start a new task with Copilot</p>
        <p class="text-muted-foreground">
          Describe your task in natural language. Copilot will work in the
          background and open a pull request for your review.
        </p>
      </div>
    </Popover.Content>
  </Popover.Root>
</ButtonGroup.Root>
```
