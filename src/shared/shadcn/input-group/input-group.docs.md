<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/input-group.md for the @stevejuma/ui native-CSS catalog. -->

# Input Group

Display additional information or actions to an input or textarea.

## Installation

```bash
pnpm ui:add input-group
```

## Usage

```html
<script lang="ts">
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
  import SearchIcon from "@lucide/svelte/icons/search";
</script>
```

```html
<InputGroup.Root>
  <InputGroup.Input placeholder="Search..." />
  <InputGroup.Addon>
    <SearchIcon />
  </InputGroup.Addon>
  <InputGroup.Addon align="inline-end">
    <InputGroup.Button>Search</InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>
```

## Examples

### Icon

```html
<script lang="ts">
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
  import CheckIcon from "@lucide/svelte/icons/check";
  import CreditCardIcon from "@lucide/svelte/icons/credit-card";
  import InfoIcon from "@lucide/svelte/icons/info";
  import MailIcon from "@lucide/svelte/icons/mail";
  import SearchIcon from "@lucide/svelte/icons/search";
  import StarIcon from "@lucide/svelte/icons/star";
</script>

<div class="grid w-full max-w-sm gap-6">
  <InputGroup.Root>
    <InputGroup.Input placeholder="Search..." />
    <InputGroup.Addon>
      <SearchIcon />
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root>
    <InputGroup.Input type="email" placeholder="Enter your email" />
    <InputGroup.Addon>
      <MailIcon />
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root>
    <InputGroup.Input placeholder="Card number" />
    <InputGroup.Addon>
      <CreditCardIcon />
    </InputGroup.Addon>
    <InputGroup.Addon align="inline-end">
      <CheckIcon />
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root>
    <InputGroup.Input placeholder="Card number" />
    <InputGroup.Addon align="inline-end">
      <StarIcon />
      <InfoIcon />
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
```

### Text

Display additional text information alongside inputs.

```html
<script lang="ts">
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
</script>

<div class="grid w-full max-w-sm gap-6">
  <InputGroup.Root>
    <InputGroup.Addon>
      <InputGroup.Text>$</InputGroup.Text>
    </InputGroup.Addon>
    <InputGroup.Input placeholder="0.00" />
    <InputGroup.Addon align="inline-end">
      <InputGroup.Text>USD</InputGroup.Text>
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root>
    <InputGroup.Addon>
      <InputGroup.Text>https://</InputGroup.Text>
    </InputGroup.Addon>
    <InputGroup.Input placeholder="example.com" class="!ps-0.5" />
    <InputGroup.Addon align="inline-end">
      <InputGroup.Text>.com</InputGroup.Text>
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root>
    <InputGroup.Input placeholder="Enter your username" />
    <InputGroup.Addon align="inline-end">
      <InputGroup.Text>@company.com</InputGroup.Text>
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root>
    <InputGroup.Textarea placeholder="Enter your message" />
    <InputGroup.Addon align="block-end">
      <InputGroup.Text class="text-muted-foreground text-xs">
        120 characters left
      </InputGroup.Text>
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
```

### Button

Add buttons to perform actions within the input group.

### Tooltip

Add tooltips to provide additional context or help.

```html
<script lang="ts">
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";
  import HelpCircleIcon from "@lucide/svelte/icons/help-circle";
  import InfoIcon from "@lucide/svelte/icons/info";
</script>

<Tooltip.Provider delayDuration="{0}">
  <div class="grid w-full max-w-sm gap-4">
    <InputGroup.Root>
      <InputGroup.Input placeholder="Enter password" type="password" />
      <InputGroup.Addon align="inline-end">
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
            <InputGroup.Button
              {...props}
              variant="ghost"
              aria-label="Info"
              size="icon-xs"
            >
              <InfoIcon />
            </InputGroup.Button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Password must be at least 8 characters</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </InputGroup.Addon>
    </InputGroup.Root>
    <InputGroup.Root>
      <InputGroup.Input placeholder="Your email address" />
      <InputGroup.Addon align="inline-end">
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
            <InputGroup.Button
              {...props}
              variant="ghost"
              aria-label="Help"
              size="icon-xs"
            >
              <HelpCircleIcon />
            </InputGroup.Button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>We'll use this to send you notifications</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </InputGroup.Addon>
    </InputGroup.Root>
    <InputGroup.Root>
      <InputGroup.Input placeholder="Enter API key" />
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
          <InputGroup.Addon>
            <InputGroup.Button
              {...props}
              variant="ghost"
              aria-label="Help"
              size="icon-xs"
            >
              <HelpCircleIcon />
            </InputGroup.Button>
          </InputGroup.Addon>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content side="left">
          <p>Click for help with API keys</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </InputGroup.Root>
  </div>
</Tooltip.Provider>
```

### Textarea

Input groups also work with textarea components. Use `block-start` or `block-end` for alignment.

```html
<script lang="ts">
  import IconBrandJavascript from "@lucide/svelte/icons/file-code";
  import IconCopy from "@lucide/svelte/icons/copy";
  import IconCornerDownLeft from "@lucide/svelte/icons/corner-down-left";
  import IconRefresh from "@lucide/svelte/icons/refresh-cw";

  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
</script>

<div class="grid w-full max-w-md gap-4">
  <InputGroup.Root>
    <InputGroup.Addon align="block-start" class="border-b">
      <InputGroup.Text class="font-mono font-medium">
        <IconBrandJavascript />
        script.js
      </InputGroup.Text>
      <InputGroup.Button class="ms-auto" size="icon-xs">
        <IconRefresh />
      </InputGroup.Button>
      <InputGroup.Button variant="ghost" size="icon-xs">
        <IconCopy />
      </InputGroup.Button>
    </InputGroup.Addon>
    <InputGroup.Textarea
      placeholder="console.log('Hello, world!');"
      class="min-h-[200px]"
    />
    <InputGroup.Addon align="block-end" class="border-t">
      <InputGroup.Text>Line 1, Column 1</InputGroup.Text>
      <InputGroup.Button size="sm" class="ms-auto" variant="default">
        Run <IconCornerDownLeft />
      </InputGroup.Button>
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
```

### Spinner

Show loading indicators while processing input.

```html
<script lang="ts">
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
  import LoaderIcon from "@lucide/svelte/icons/loader";
</script>

<div class="grid w-full max-w-sm gap-4">
  <InputGroup.Root data-disabled>
    <InputGroup.Input placeholder="Searching..." disabled />
    <InputGroup.Addon align="inline-end">
      <Spinner />
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root data-disabled>
    <InputGroup.Input placeholder="Processing..." disabled />
    <InputGroup.Addon>
      <Spinner />
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root data-disabled>
    <InputGroup.Input placeholder="Saving changes..." disabled />
    <InputGroup.Addon align="inline-end">
      <InputGroup.Text>Saving...</InputGroup.Text>
      <Spinner />
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root data-disabled>
    <InputGroup.Input placeholder="Refreshing data..." disabled />
    <InputGroup.Addon>
      <LoaderIcon class="animate-spin" />
    </InputGroup.Addon>
    <InputGroup.Addon align="inline-end">
      <InputGroup.Text class="text-muted-foreground"
        >Please wait...</InputGroup.Text
      >
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
```

### Label

Add labels within input groups to improve accessibility.

```html
<script lang="ts">
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
  import * as Label from "@stevejuma/ui/shadcn/label";
  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";
  import InfoIcon from "@lucide/svelte/icons/info";
</script>

<Tooltip.Provider delayDuration="{0}">
  <div class="grid w-full max-w-sm gap-4">
    <InputGroup.Root>
      <InputGroup.Input id="email" placeholder="shadcn" />
      <InputGroup.Addon>
        <Label.Root for="email">@</Label.Root>
      </InputGroup.Addon>
    </InputGroup.Root>
    <InputGroup.Root>
      <InputGroup.Input id="email-2" placeholder="shadcn@vercel.com" />
      <InputGroup.Addon align="block-start">
        <Label.Root for="email-2" class="text-foreground">Email</Label.Root>
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
            <InputGroup.Button
              {...props}
              variant="ghost"
              aria-label="Help"
              class="ms-auto rounded-full"
              size="icon-xs"
            >
              <InfoIcon />
            </InputGroup.Button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>We'll use this to send you notifications</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </InputGroup.Addon>
    </InputGroup.Root>
  </div>
</Tooltip.Provider>
```

### Dropdown

Pair input groups with dropdown menus for complex interactions.

```html
<script lang="ts">
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import MoreHorizontalIcon from "@lucide/svelte/icons/more-horizontal";
</script>

<div class="grid w-full max-w-sm gap-4">
  <InputGroup.Root>
    <InputGroup.Input placeholder="Enter file name" />
    <InputGroup.Addon align="inline-end">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
          <InputGroup.Button
            {...props}
            variant="ghost"
            aria-label="More"
            size="icon-xs"
          >
            <MoreHorizontalIcon />
          </InputGroup.Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item>Settings</DropdownMenu.Item>
          <DropdownMenu.Item>Copy path</DropdownMenu.Item>
          <DropdownMenu.Item>Open location</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </InputGroup.Addon>
  </InputGroup.Root>
  <InputGroup.Root class="[--radius:1rem]">
    <InputGroup.Input placeholder="Enter search query" />
    <InputGroup.Addon align="inline-end">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
          <InputGroup.Button {...props} variant="ghost" class="!pe-1.5 text-xs">
            Search In... <ChevronDownIcon class="size-3" />
          </InputGroup.Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="[--radius:0.95rem]">
          <DropdownMenu.Item>Documentation</DropdownMenu.Item>
          <DropdownMenu.Item>Blog Posts</DropdownMenu.Item>
          <DropdownMenu.Item>Changelog</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
```

### Button Group

Wrap input groups with button groups to create prefixes and suffixes.

### Custom Input

Add the `data-slot="input-group-control"` attribute to your custom input for automatic behavior and focus state handling.

No style is applied to the custom input. Apply your own styles using the `class` prop.

```html
<script lang="ts">
  import * as InputGroup from "@stevejuma/ui/shadcn/input-group";
</script>

<div class="grid w-full max-w-sm gap-6">
  <InputGroup.Root>
    <textarea
      data-slot="input-group-control"
      class="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
      placeholder="Autoresize textarea..."
    ></textarea>
    <InputGroup.Addon align="block-end">
      <InputGroup.Button class="ms-auto" size="sm" variant="default">
        Submit
      </InputGroup.Button>
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
```
