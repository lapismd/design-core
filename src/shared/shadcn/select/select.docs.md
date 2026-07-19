<!-- Adapted from https://shadcn-svelte.com/docs/components/select.md for the @stevejuma/ui native-CSS catalog. -->

# Select

Displays a list of options for the user to pick fromtriggered by a button.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as Select from "@stevejuma/ui/shadcn/select";
</script>
```

```svelte
<Select.Root type="single">
  <Select.Trigger class="w-[180px]"></Select.Trigger>
  <Select.Content>
    <Select.Item value="light">Light</Select.Item>
    <Select.Item value="dark">Dark</Select.Item>
    <Select.Item value="system">System</Select.Item>
  </Select.Content>
</Select.Root>
```

## [Examples](#examples)

### [Scrollable](#scrollable)
