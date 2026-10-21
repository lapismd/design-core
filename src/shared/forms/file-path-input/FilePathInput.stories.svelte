<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import FilePathInput from "./FilePathInput.svelte";
  import Fixture from "./FilePathInput.stories.fixture.svelte";
  import { Basic } from "./FilePathInput.example-sources.js";
  const { Story } = defineMeta({
    title: "UI Forms/File Path Input",
    component: FilePathInput,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Select and cancel"
  play={async ({ canvas }) => {
    await document.fonts.ready;
    const input = canvas.getByRole("textbox");
    const browse = canvas.getByRole("button", { name: "Browse Model file" });
    const group = canvas.getByRole("group", { name: "Model file" });
    const initialBounds = group.getBoundingClientRect();
    await expect(canvas.getByTestId("calls")).toHaveTextContent("0");
    await expect(getComputedStyle(group).boxShadow).toBe("none");
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await waitFor(() =>
      expect(getComputedStyle(group).boxShadow).toContain("3px"),
    );
    await waitFor(() => expect(getComputedStyle(input).boxShadow).toBe("none"));
    await expect(group.getBoundingClientRect().right).toBeGreaterThanOrEqual(
      browse.getBoundingClientRect().right,
    );
    await userEvent.tab();
    await expect(browse).toHaveFocus();
    await expect(getComputedStyle(group).boxShadow).toContain("3px");
    await expect(getComputedStyle(group).borderTopRightRadius).toBe(
      getComputedStyle(browse).borderTopRightRadius,
    );
    await userEvent.tab({ shift: true });
    await expect(input).toHaveFocus();
    await expect(getComputedStyle(group).boxShadow).toContain("3px");
    await userEvent.tab({ shift: true });
    await expect(getComputedStyle(group).boxShadow).toBe("none");
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.tab();
    await expect(browse).toHaveFocus();
    await expect(group.getBoundingClientRect().width).toBe(initialBounds.width);
    await expect(group.getBoundingClientRect().height).toBe(
      initialBounds.height,
    );
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("/models/selected.gguf");
    await userEvent.click(browse);
    await expect(input).toHaveValue("/models/selected.gguf");
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Manual path"
  play={async ({ canvas }) => {
    await expect(canvas.queryByRole("button")).toBeNull();
    await userEvent.clear(canvas.getByRole("textbox"));
    await userEvent.type(canvas.getByRole("textbox"), "/tmp/manual.gguf");
    await expect(canvas.getByTestId("path")).toHaveTextContent(
      "/tmp/manual.gguf",
    );
    await expect(
      getComputedStyle(canvas.getByRole("group", { name: "Model file" }))
        .boxShadow,
    ).toContain("3px");
  }}>{#snippet template()}<Fixture manual />{/snippet}</Story
>
<Story
  name="Stale selection"
  play={async ({ canvas }) => {
    const browse = canvas.getByRole("button", { name: "Browse Model file" });
    await userEvent.click(browse);
    await expect(browse).toBeDisabled();
    await userEvent.clear(canvas.getByRole("textbox"));
    await userEvent.type(canvas.getByRole("textbox"), "/models/newer.gguf");
    await userEvent.click(
      canvas.getByRole("button", { name: "Finish chooser" }),
    );
    await waitFor(() => expect(browse).toBeEnabled());
    await expect(canvas.getByRole("textbox")).toHaveValue("/models/newer.gguf");
  }}>{#snippet template()}<Fixture delayed />{/snippet}</Story
>
<Story
  name="Failure preserves path"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Browse Model file" }),
    );
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Unable to select a file",
    );
    await expect(canvas.getByRole("textbox")).toHaveValue(
      "/models/original.gguf",
    );
  }}>{#snippet template()}<Fixture failure />{/snippet}</Story
>
<Story
  name="Disabled"
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toBeDisabled();
    await expect(canvas.getByRole("button")).toBeDisabled();
    await expect(canvas.getByTestId("calls")).toHaveTextContent("0");
    await expect(
      getComputedStyle(canvas.getByRole("group", { name: "Model file" }))
        .boxShadow,
    ).toBe("none");
  }}>{#snippet template()}<Fixture disabled />{/snippet}</Story
>

<Story
  name="Read only"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("textbox");
    await expect(input).toHaveAttribute("readonly");
    await expect(canvas.getByRole("button")).toBeDisabled();
    await userEvent.type(input, "/ignored");
    await expect(input).toHaveValue("/models/original.gguf");
    await expect(canvas.getByTestId("calls")).toHaveTextContent("0");
    await expect(
      getComputedStyle(canvas.getByRole("group", { name: "Model file" }))
        .boxShadow,
    ).toContain("3px");
  }}>{#snippet template()}<Fixture readonly />{/snippet}</Story
>

<Story
  name="Invalid"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("textbox");
    const group = canvas.getByRole("group", { name: "Model file" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    const invalidRing = getComputedStyle(group).boxShadow;
    await expect(invalidRing).toContain("3px");
    await expect(getComputedStyle(input).boxShadow).toBe("none");
    await userEvent.click(input);
    await expect(getComputedStyle(group).boxShadow).toBe(invalidRing);
    await userEvent.tab();
    await expect(canvas.getByRole("button")).toHaveFocus();
    await expect(getComputedStyle(group).boxShadow).toBe(invalidRing);
  }}>{#snippet template()}<Fixture invalid />{/snippet}</Story
>
