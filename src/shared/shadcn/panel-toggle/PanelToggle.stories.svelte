<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Columns from "@lucide/svelte/icons/columns-2";
  import { PanelToggle, PanelToggleIcon } from "./index.js";
  import "./PanelToggle.stories.css";
  import { Comparison } from "./PanelToggle.example-sources.js";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Panel Toggle",
    component: PanelToggle,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Comparison, language: "tsx", type: "code" } },
    },
  });
</script>

<script lang="ts">
  let customExpanded = $state(true);
  let composedExpanded = $state(false);
  let comparisonStates = $state<Record<string, boolean>>({});
  const variants = ["standard", "compact"] as const;
  const sides = ["left", "right", "top", "bottom"] as const;
  const states = ["collapsed", "expanded", "disabled"] as const;
</script>

<Story
  name="Variant comparison"
  play={async ({ canvas }) => {
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(26);
    for (const button of buttons) {
      const initial = button.getAttribute("aria-expanded");
      if (button.hasAttribute("disabled")) {
        await expect(button).toBeDisabled();
        // Native activation must also be inert; pointer-events blocks userEvent.
        button.click();
        await expect(button).toHaveAttribute("aria-expanded", "true");
      } else {
        await userEvent.click(button);
        await expect(button).toHaveAttribute(
          "aria-expanded",
          initial === "true" ? "false" : "true",
        );
        await userEvent.click(button);
        await expect(button).toHaveAttribute("aria-expanded", initial);
      }
    }
    const native = canvas.getByRole("button", { name: "Toggle inspector" });
    const icon = native.querySelector("svg");
    await expect(icon).toHaveClass("panel-toggle-demo-icon");
    await expect(icon).toHaveAttribute("data-icon", "inline-start");
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(icon).toHaveAttribute("focusable", "false");
    await expect(
      canvas
        .getByRole("button", { name: "Toggle custom preview" })
        .querySelector('[data-ui-component="panel-toggle"]'),
    ).toBeNull();
    // Leave the matrix showing the actual states, without a focused hover preview.
    canvas.getByRole("button", { name: "Toggle custom preview" }).blur();
  }}
>
  {#snippet template()}
    <div class="panel-toggle-comparison">
      {#each variants as iconVariant}
        <section aria-label={`${iconVariant} icons`}>
          <h2>{iconVariant === "standard" ? "Standard" : "Compact"}</h2>
          <p>
            {iconVariant === "standard"
              ? "Workspace geometry"
              : "Column Canvas geometry"}
          </p>
          <table>
            <thead
              ><tr
                ><th scope="col">Edge</th><th scope="col"
                  >Initially collapsed</th
                ><th scope="col">Initially expanded</th><th scope="col"
                  >Disabled</th
                ></tr
              ></thead
            >
            <tbody>
              {#each sides as side}
                <tr>
                  <th scope="row">{side}</th>
                  {#each states as state}
                    {@const key = `${iconVariant}-${side}-${state}`}
                    {@const initial = state !== "collapsed"}
                    <td>
                      <PanelToggle
                        {side}
                        {iconVariant}
                        disabled={state === "disabled"}
                        expanded={comparisonStates[key] ?? initial}
                        aria-label={`${iconVariant} ${side} ${state === "disabled" ? "disabled" : `initially ${state}`}`}
                        onclick={() =>
                          (comparisonStates[key] = !(
                            comparisonStates[key] ?? initial
                          ))}
                      />
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </section>
      {/each}
    </div>
    <div class="panel-toggle-composition">
      <section aria-label="Native button composition">
        <h2>Existing button</h2>
        <p>Host-owned sizing and state, with no hover preview.</p>
        <button
          type="button"
          class="panel-toggle-demo-button"
          aria-label="Toggle inspector"
          aria-expanded={composedExpanded}
          onclick={() => (composedExpanded = !composedExpanded)}
        >
          <PanelToggleIcon
            side="right"
            iconVariant="standard"
            expanded={composedExpanded}
            class="panel-toggle-demo-icon"
            data-icon="inline-start"
            style="color: var(--foreground)"
          />
          Inspector
        </button>
      </section>
      <section aria-label="Custom content composition">
        <h2>Custom icon</h2>
        <p>Optional content inside the controlled button.</p>
        <div class="panel-toggle-demo-row">
          <PanelToggle
            expanded={customExpanded}
            aria-label="Toggle custom preview"
            onclick={() => (customExpanded = !customExpanded)}
            ><Columns aria-hidden="true" /></PanelToggle
          >
          <output>Preview {customExpanded ? "expanded" : "collapsed"}</output>
        </div>
      </section>
    </div>
  {/snippet}
</Story>
