export const Basic = `<script lang="ts">
  import { FileTypeIcon } from "@lapismd/design-core/shadcn/file-type-icon";
</script>

<span><FileTypeIcon path="src/main.ts" /> main.ts</span>`;

export const Named = `<script lang="ts">
  import { FileTypeIcon } from "@lapismd/design-core/shadcn/file-type-icon";
</script>

<FileTypeIcon path="Dockerfile" title="Docker configuration" />`;

export const Styling = `<script lang="ts">
  import { FileTypeIcon } from "@lapismd/design-core/shadcn/file-type-icon";
</script>

<div style="--ui-file-type-icon-size: 1.5rem; --ui-file-type-icon-fallback-color: var(--foreground)">
  <FileTypeIcon path="config/package.json" />
</div>`;

export const Reactive = `<script lang="ts">
  import { FileTypeIcon } from "@lapismd/design-core/shadcn/file-type-icon";
  let path = $state("src/main.ts");
</script>

<label>Filename <input bind:value={path} /></label>
<FileTypeIcon {path} title="Selected file type" />`;

export const Sizes = `<script lang="ts">
  import { FileTypeIcon } from "@lapismd/design-core/shadcn/file-type-icon";
</script>

<FileTypeIcon path="paper.pdf" size="xs" />
<FileTypeIcon path="paper.pdf" size="s" />
<FileTypeIcon path="paper.pdf" size="md" />
<FileTypeIcon path="paper.pdf" size="lg" />`;
