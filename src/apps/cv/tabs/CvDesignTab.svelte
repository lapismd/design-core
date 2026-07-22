<script lang="ts">
  import { FormField } from "@stevejuma/ui/forms";
  import type { CvDesign } from "../types";
  import TextControl from "../controls/TextControl.svelte";
  import ColorControl from "../controls/ColorControl.svelte";

  let {
    value = {},
    onChange,
  }: {
    value?: CvDesign;
    onChange: (value: CvDesign) => void;
  } = $props();

  function patchPage(partial: NonNullable<CvDesign["page"]>) {
    onChange({ ...value, page: { ...value.page, ...partial } });
  }

  function patchColors(partial: NonNullable<CvDesign["colors"]>) {
    onChange({ ...value, colors: { ...value.colors, ...partial } });
  }

  function patchTypography(partial: NonNullable<CvDesign["typography"]>) {
    onChange({ ...value, typography: { ...value.typography, ...partial } });
  }
</script>

<div
  class="flex max-w-[646px] flex-col gap-6 py-4 pr-11 pl-10"
  data-ui-part="cv-design-tab"
>
  <section class="flex flex-col gap-2">
    <h3 class="text-base font-semibold">Page</h3>
    <div class="cv-structured-form">
      <FormField as="div" label="Size">
        <TextControl
          label="Size"
          showLabel={false}
          value={value.page?.size ?? ""}
          onChange={(size) => patchPage({ size })}
        />
      </FormField>
      <FormField as="div" label="Top margin">
        <TextControl
          label="Top margin"
          showLabel={false}
          value={value.page?.top_margin ?? ""}
          onChange={(top_margin) => patchPage({ top_margin })}
        />
      </FormField>
      <FormField as="div" label="Bottom margin">
        <TextControl
          label="Bottom margin"
          showLabel={false}
          value={value.page?.bottom_margin ?? ""}
          onChange={(bottom_margin) => patchPage({ bottom_margin })}
        />
      </FormField>
    </div>
  </section>

  <section class="flex flex-col gap-2">
    <h3 class="text-base font-semibold">Colors</h3>
    <div class="cv-structured-form">
      <FormField as="div" label="Text" align="center">
        <ColorControl
          label="Text"
          showLabel={false}
          value={value.colors?.text ?? "#222222"}
          onChange={(text) => patchColors({ text })}
        />
      </FormField>
      <FormField as="div" label="Name" align="center">
        <ColorControl
          label="Name"
          showLabel={false}
          value={value.colors?.name ?? "#000000"}
          onChange={(name) => patchColors({ name })}
        />
      </FormField>
      <FormField as="div" label="Connections" align="center">
        <ColorControl
          label="Connections"
          showLabel={false}
          value={value.colors?.connections ?? "#0a66c2"}
          onChange={(connections) => patchColors({ connections })}
        />
      </FormField>
    </div>
  </section>

  <section class="flex flex-col gap-2">
    <h3 class="text-base font-semibold">Typography</h3>
    <div class="cv-structured-form">
      <FormField as="div" label="Font family">
        <TextControl
          label="Font family"
          showLabel={false}
          value={value.typography?.font_family ?? ""}
          onChange={(font_family) => patchTypography({ font_family })}
        />
      </FormField>
      <FormField as="div" label="Font size">
        <TextControl
          label="Font size"
          showLabel={false}
          value={value.typography?.font_size ?? ""}
          onChange={(font_size) => patchTypography({ font_size })}
        />
      </FormField>
    </div>
  </section>
</div>
