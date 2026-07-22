## Installation

```bash
pnpm ui:add field
```

## Usage

```html
<script lang="ts">
  import * as Field from "@stevejuma/ui/shadcn/field";
</script>
```

```html
<Field.Set>
  <Field.Legend>Profile</Field.Legend>
  <Field.Description>This appears on invoices and emails.</Field.Description>
  <Field.Group>
    <Field.Field>
      <Field.Label for="name">Full name</Field.Label>
      <input id="name" autocomplete="off" placeholder="Evil Rabbit" />
      <Field.Description
        >This appears on invoices and emails.</Field.Description
      >
    </Field.Field>
    <Field.Field>
      <Field.Label for="username">Username</Field.Label>
      <input id="username" autocomplete="off" aria-invalid />
      <Field.Error>Choose another username.</Field.Error>
    </Field.Field>
    <Field.Field orientation="horizontal">
      <Switch id="newsletter" />
      <Field.Label for="newsletter">Subscribe to the newsletter</Field.Label>
    </Field.Field>
  </Field.Group>
</Field.Set>
```

## Anatomy

The `Field` family is designed for composing accessible forms. A typical field is structured as follows:

```html
<Field.Field>
  <Field.Label for="input-id">Label</Field.Label>
  <!-- Input, Select, Switch, etc. -->
  <Field.Description>Optional helper text.</Field.Description>
  <Field.Error>Validation message.</Field.Error>
</Field.Field>
```

- `Field.Field` is the core wrapper for a single field.
- `Field.Content` is a flex column that groups label and description. Not required if you have no description.
- Wrap related fields with `Field.Group`, and use `Field.Set` with `Field.Legend` for semantic grouping.

## Examples

### Input

```html
<script lang="ts">
  import * as Field from "@stevejuma/ui/shadcn/field";
  import { Input } from "@stevejuma/ui/shadcn/input";
</script>

<div class="w-full max-w-md">
  <Field.Set>
    <Field.Group>
      <Field.Field>
        <Field.Label for="username">Username</Field.Label>
        <input id="username" type="text" placeholder="Max Leiter" />
        <Field.Description
          >Choose a unique username for your account.</Field.Description
        >
      </Field.Field>
      <Field.Field>
        <Field.Label for="password">Password</Field.Label>
        <Field.Description
          >Must be at least 8 characters long.</Field.Description
        >
        <input id="password" type="password" placeholder="••••••••" />
      </Field.Field>
    </Field.Group>
  </Field.Set>
</div>
```

### Textarea

```html
<script lang="ts">
  import * as Field from "@stevejuma/ui/shadcn/field";
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<div class="w-full max-w-md">
  <Field.Set>
    <Field.Group>
      <Field.Field>
        <Field.Label for="feedback">Feedback</Field.Label>
        <textarea
          id="feedback"
          placeholder="Your feedback helps us improve..."
          rows="{4}"
        />
        <Field.Description
          >Share your thoughts about our service.</Field.Description
        >
      </Field.Field>
    </Field.Group>
  </Field.Set>
</div>
```

### Select

```html
<script lang="ts">
  import * as Field from "@stevejuma/ui/shadcn/field";
  import * as Select from "@stevejuma/ui/shadcn/select";

  let department = $state<string>();

  const departments = [
    { value: "engineering", label: "Engineering" },
    { value: "design", label: "Design" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "support", label: "Customer Support" },
    { value: "hr", label: "Human Resources" },
    { value: "finance", label: "Finance" },
    { value: "operations", label: "Operations" },
  ];

  const departmentLabel = $derived(
    departments.find((d) => d.value === department)?.label ??
      "Choose department",
  );
</script>

<div class="w-full max-w-md">
  <Field.Field>
    <Field.Label for="department">Department</Field.Label>
    <Select.Root type="single" bind:value="{department}">
      <Select.Trigger id="department"> {departmentLabel} </Select.Trigger>
      <Select.Content>
        {#each departments as department (department.value)}
        <Select.Item {...department} />
        {/each}
      </Select.Content>
    </Select.Root>
    <Field.Description
      >Select your department or area of work.</Field.Description
    >
  </Field.Field>
</div>
```

### Slider

### Fieldset

```html
<script lang="ts">
  import * as Field from "@stevejuma/ui/shadcn/field";
  import { Input } from "@stevejuma/ui/shadcn/input";
</script>

<div class="w-full max-w-md space-y-6">
  <Field.Set>
    <Field.Legend>Address Information</Field.Legend>
    <Field.Description
      >We need your address to deliver your order.</Field.Description
    >
    <Field.Group>
      <Field.Field>
        <Field.Label for="street">Street Address</Field.Label>
        <input id="street" type="text" placeholder="123 Main St" />
      </Field.Field>
      <div class="grid grid-cols-2 gap-4">
        <Field.Field>
          <Field.Label for="city">City</Field.Label>
          <input id="city" type="text" placeholder="New York" />
        </Field.Field>
        <Field.Field>
          <Field.Label for="zip">Postal Code</Field.Label>
          <input id="zip" type="text" placeholder="90502" />
        </Field.Field>
      </div>
    </Field.Group>
  </Field.Set>
</div>
```

### Checkbox

```html
<script lang="ts">
  import * as Field from "@stevejuma/ui/shadcn/field";
  import { Checkbox } from "@stevejuma/ui/shadcn/checkbox";
</script>

<div class="w-full max-w-md">
  <Field.Group>
    <Field.Set>
      <Field.Legend variant="label"
        >Show these items on the desktop</Field.Legend
      >
      <Field.Description
        >Select the items you want to show on the desktop.</Field.Description
      >
      <Field.Group class="gap-3">
        <Field.Field orientation="horizontal">
          <Checkbox id="finder-pref-9k2-hard-disks-ljj" checked />
          <Field.Label for="finder-pref-9k2-hard-disks-ljj" class="font-normal">
            Hard disks
          </Field.Label>
        </Field.Field>
        <Field.Field orientation="horizontal">
          <Checkbox id="finder-pref-9k2-external-disks-1yg" />
          <Field.Label
            for="finder-pref-9k2-external-disks-1yg"
            class="font-normal"
          >
            External disks
          </Field.Label>
        </Field.Field>
        <Field.Field orientation="horizontal">
          <Checkbox id="finder-pref-9k2-cds-dvds-fzt" />
          <Field.Label for="finder-pref-9k2-cds-dvds-fzt" class="font-normal">
            CDs, DVDs, and iPods
          </Field.Label>
        </Field.Field>
        <Field.Field orientation="horizontal">
          <Checkbox id="finder-pref-9k2-connected-servers-6l2" />
          <Field.Label
            for="finder-pref-9k2-connected-servers-6l2"
            class="font-normal"
          >
            Connected servers
          </Field.Label>
        </Field.Field>
      </Field.Group>
    </Field.Set>
    <Field.Separator />
    <Field.Field orientation="horizontal">
      <Checkbox id="finder-pref-9k2-sync-folders-nep" checked />
      <Field.Content>
        <Field.Label for="finder-pref-9k2-sync-folders-nep">
          Sync Desktop & Documents folders
        </Field.Label>
        <Field.Description>
          Your Desktop & Documents folders are being synced with iCloud Drive.
          You can access them from other devices.
        </Field.Description>
      </Field.Content>
    </Field.Field>
  </Field.Group>
</div>
```

### Radio

### Switch

```html
<script lang="ts">
  import * as Field from "@stevejuma/ui/shadcn/field";
  import { Switch } from "@stevejuma/ui/shadcn/switch";
</script>

<div class="w-full max-w-md">
  <Field.Field orientation="horizontal">
    <Field.Content>
      <Field.Label for="2fa">Multi-factor authentication</Field.Label>
      <Field.Description>
        Enable multi-factor authentication. If you do not have a two-factor
        device, you can use a one-time code sent to your email.
      </Field.Description>
    </Field.Content>
    <Switch id="2fa" />
  </Field.Field>
</div>
```

### Choice Card

Wrap `Field` components inside `FieldLabel` to create selectable field groups. This works with `RadioItem`, `Checkbox` and `Switch` components.

### Field Group

Stack `Field` components with `Field.Group`. Add `Field.Separator` to divide them.

```html
<script lang="ts">
  import * as Field from "@stevejuma/ui/shadcn/field";
  import { Checkbox } from "@stevejuma/ui/shadcn/checkbox";
</script>

<div class="w-full max-w-md">
  <Field.Group>
    <Field.Set>
      <Field.Label>Responses</Field.Label>
      <Field.Description>
        Get notified when ChatGPT responds to requests that take time, like
        research or image generation.
      </Field.Description>
      <Field.Group data-slot="checkbox-group">
        <Field.Field orientation="horizontal">
          <Checkbox id="push" checked disabled />
          <Field.Label for="push" class="font-normal"
            >Push notifications</Field.Label
          >
        </Field.Field>
      </Field.Group>
    </Field.Set>
    <Field.Separator />
    <Field.Set>
      <Field.Label>Tasks</Field.Label>
      <Field.Description>
        Get notified when tasks you've created have updates.
        <a href="#/">Manage tasks</a>
      </Field.Description>
      <Field.Group data-slot="checkbox-group">
        <Field.Field orientation="horizontal">
          <Checkbox id="push-tasks" />
          <Field.Label for="push-tasks" class="font-normal">
            Push notifications
          </Field.Label>
        </Field.Field>
        <Field.Field orientation="horizontal">
          <Checkbox id="email-tasks" />
          <Field.Label for="email-tasks" class="font-normal">
            Email notifications
          </Field.Label>
        </Field.Field>
      </Field.Group>
    </Field.Set>
  </Field.Group>
</div>
```

### Responsive Layout

- **Vertical fields:** Default orientation stacks label, control, and helper text—ideal for mobile-first layouts.
- **Horizontal fields:** Set `orientation="horizontal"` on `Field` to align the label and control side-by-side. Pair with `Field.Content` to keep descriptions aligned.
- **Responsive fields:** Set `orientation="responsive"` for automatic column layouts inside container-aware parents. Apply `@container/field-group` classes on `Field.Group` to switch orientations at specific breakpoints.

```html
<script lang="ts">
  import * as Field from "@stevejuma/ui/shadcn/field";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Input } from "@stevejuma/ui/shadcn/input";
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";
</script>

<div class="w-full max-w-4xl">
  <form>
    <Field.Set>
      <Field.Legend>Profile</Field.Legend>
      <Field.Description>Fill in your profile information.</Field.Description>
      <Field.Separator />
      <Field.Group>
        <Field.Field orientation="responsive">
          <Field.Content>
            <Field.Label for="name">Name</Field.Label>
            <Field.Description>
              Provide your full name for identification
            </Field.Description>
          </Field.Content>
          <input id="name" placeholder="Evil Rabbit" required />
        </Field.Field>
        <Field.Separator />
        <Field.Field orientation="responsive">
          <Field.Content>
            <Field.Label for="message">Message</Field.Label>
            <Field.Description>
              You can write your message here. Keep it short, preferably under
              100 characters.
            </Field.Description>
          </Field.Content>
          <textarea
            id="message"
            placeholder="Hello, world!"
            required
            class="min-h-[100px] resize-none sm:min-w-[300px]"
          />
        </Field.Field>
        <Field.Separator />
        <Field.Field orientation="responsive">
          <button type="submit">Submit</button>
          <button type="button" variant="outline">Cancel</button>
        </Field.Field>
      </Field.Group>
    </Field.Set>
  </form>
</div>
```

## Validation and Errors

- Add `data-invalid` to `Field` to switch the entire block into an error state.
- Add `aria-invalid` on the input itself for assistive technologies.
- Render `FieldError` immediately after the control or inside `FieldContent` to keep error messages aligned with the field.
  Copy

## Accessibility

- `Field.Set` and `Field.Legend` keep related controls grouped for keyboard and assistive tech users.
- `Field` outputs `role="group"` so nested controls inherit labeling from `Field.Label` and `Field.Legend` when combined.
- Apply `Field.Separator` sparingly to ensure screen readers encounter clear section boundaries.
