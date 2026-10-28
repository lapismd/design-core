<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/radio-group.md for the @lapismd/design-core native-CSS catalog. -->

# Radio Group

A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.

## Installation

```bash
pnpm ui:add radio-group
```

## Usage

```html
<script lang="ts">
  import { Label } from "@lapismd/design-core/shadcn/label";
  import * as RadioGroup from "@lapismd/design-core/shadcn/radio-group";
</script>
```

```html
<RadioGroup.Root value="option-one">
  <div class="flex items-center space-x-2">
    <RadioGroup.Item value="option-one" id="option-one" />
    <label for="option-one">Option One</label>
  </div>
  <div class="flex items-center space-x-2">
    <RadioGroup.Item value="option-two" id="option-two" />
    <label for="option-two">Option Two</label>
  </div>
</RadioGroup.Root>
```
