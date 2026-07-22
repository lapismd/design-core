<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/alert.md for the @stevejuma/ui native-CSS catalog. -->

# Alert

Displays a callout for user attention.

## Installation

```bash
pnpm ui:add alert
```

## Usage

```html
<script lang="ts">
  import * as Alert from "@stevejuma/ui/shadcn/alert";
</script>
```

```html
<Alert.Root>
  <Alert.Title>Heads up!</Alert.Title>
  <Alert.Description>
    You can add components to your app using the cli.
  </Alert.Description>
</Alert.Root>
```
