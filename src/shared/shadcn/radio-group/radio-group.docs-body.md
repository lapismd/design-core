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
