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
    const browse = canvas.getByRole("button", { name: "Browse Model file" });
    await expect(canvas.getByTestId("calls")).toHaveTextContent("0");
    await userEvent.click(browse);
    await expect(canvas.getByRole("textbox")).toHaveValue(
      "/models/selected.gguf",
    );
    await userEvent.click(browse);
    await expect(canvas.getByRole("textbox")).toHaveValue(
      "/models/selected.gguf",
    );
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
  }}>{#snippet template()}<Fixture disabled />{/snippet}</Story
>
