<!-- Adapted from https://shadcn-svelte.com/docs/components/tabs.md for the @stevejuma/ui native-CSS catalog. -->

# Tabs

A set of layered sections of contentknown as tab panelsthat are displayed one at a time.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as Tabs from "@stevejuma/ui/shadcn/tabs";
</script>
```

```svelte
<Tabs.Root value="account" class="w-[400px]">
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">
    Make changes to your account here.
  </Tabs.Content>
  <Tabs.Content value="password">Change your password here.</Tabs.Content>
</Tabs.Root>
```
