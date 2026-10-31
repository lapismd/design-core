<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within, waitFor } from "storybook/test";
  import DeclarativeSettingsSection from "./DeclarativeSettingsSection.svelte";
  import Fixture from "./WorkspaceSettingsInputs.stories.fixture.svelte";
  import { Basic as code } from "./WorkspaceSettingsInputs.example-sources.js";
  const { Story } = defineMeta({
    title: "Workspace/Settings/Unit and File Inputs",
    component: DeclarativeSettingsSection,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: code, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Declared controls"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("spinbutton", { name: "Delay" });
    await expect(input).toHaveValue(1);
    await userEvent.click(
      canvas.getByRole("combobox", { name: /^Delay unit: / }),
    );
    await userEvent.click(
      await within(document.body).findByRole("option", { name: /^ms$/ }),
    );
    await expect(input).toHaveValue(1000);
    await expect(canvas.getByTestId("delay-value")).toHaveTextContent("1000");
    await waitFor(() =>
      expect(getComputedStyle(document.body).pointerEvents).not.toBe("none"),
    );
    await userEvent.clear(input);
    await userEvent.type(input, "0.1");
    await expect(input).toHaveValue(0.1);
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByTestId("delay-value")).toHaveTextContent("1000");
    await userEvent.click(
      canvas.getByRole("button", { name: "Reset Delay to default" }),
    );
    await expect(input).toHaveValue(1000);
    await userEvent.clear(input);
    await userEvent.type(input, "2000");
    await expect(canvas.getByTestId("delay-value")).toHaveTextContent("2000");
    await userEvent.click(
      canvas.getByRole("button", { name: "Browse Model file" }),
    );
    await expect(canvas.getByTestId("model-value")).toHaveTextContent(
      "/models/selected.gguf",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Browse Model file" }),
    );
    await expect(canvas.getByTestId("model-value")).toHaveTextContent(
      "/models/selected.gguf",
    );
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
