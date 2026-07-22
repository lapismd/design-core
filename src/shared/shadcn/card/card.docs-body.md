## Installation

```bash
pnpm ui:add card
```

## Usage

```html
<script lang="ts">
  import * as Card from "@stevejuma/ui/shadcn/card";
</script>
```

```html
<Card.Root>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card Description</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Card Content</p>
  </Card.Content>
  <Card.Footer>
    <p>Card Footer</p>
  </Card.Footer>
</Card.Root>
```

## Examples

### Spacing

In addition to the `size` prop, you can use the `--card-spacing` CSS variable to control the spacing between sections and the inset of card parts.

Use negative margins with `-mx-(--card-spacing)` to make content go edge to edge while keeping it aligned with the card inset. When the edge-to-edge content sits above a footer, use `-mb-(--card-spacing)` on `CardContent` to remove the section gap.

```html
<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Card from "@stevejuma/ui/shadcn/card";
</script>

<Card.Root class="mx-auto w-full max-w-sm">
  <Card.Header>
    <Card.Title>Terms of Service</Card.Title>
    <Card.Description
      >Review the terms before accepting the agreement.</Card.Description
    >
  </Card.Header>
  <Card.Content class="-mb-(--card-spacing)">
    <div
      class="bg-muted/50 -mx-(--card-spacing) max-h-48 space-y-4 overflow-y-scroll border-t px-(--card-spacing) py-4 text-sm leading-relaxed"
    >
      <p>
        These terms govern your use of the workspace, including access to shared
        documents, project files, and collaboration tools.
      </p>
      <p>
        You are responsible for the content you upload and for ensuring that
        your team has the appropriate permissions to view or edit it.
      </p>
      <p>
        We may update features or limits as the service evolves. When those
        changes materially affect your workflow, we will notify your workspace
        administrators.
      </p>
      <p>
        By continuing, you agree to keep your account credentials secure and to
        follow your organization's acceptable use policies.
      </p>
    </div>
  </Card.Content>
  <Card.Footer class="justify-end gap-2">
    <button variant="outline">Decline</button>
    <button>Accept</button>
  </Card.Footer>
</Card.Root>
```

### Image

Add an image before the card header to create a card with an image.

```html
<script lang="ts">
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Card from "@stevejuma/ui/shadcn/card";
</script>

<Card.Root class="relative mx-auto w-full max-w-sm pt-0">
  <div class="absolute inset-0 z-30 aspect-video bg-black/35"></div>
  <img
    src="https://avatar.vercel.sh/shadcn1"
    alt="Event cover"
    class="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
  />
  <Card.Header>
    <Card.Action>
      <Badge variant="secondary">Featured</Badge>
    </Card.Action>
    <Card.Title>Design systems meetup</Card.Title>
    <Card.Description>
      A practical talk on component APIs, accessibility, and shipping faster.
    </Card.Description>
  </Card.Header>
  <Card.Footer>
    <button class="w-full">View Event</button>
  </Card.Footer>
</Card.Root>
```
