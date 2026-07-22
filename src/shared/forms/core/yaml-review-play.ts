import { expect, userEvent } from "storybook/test";

/** Shared play helper for YAML CodeMirror Keep/Undo review chrome. */
export async function clickYamlReviewButton(
  canvasElement: HTMLElement,
  kind: "keep" | "undo",
) {
  expect(canvasElement.querySelector(".cm-ai-review-block")).not.toBeNull();
  const selector =
    kind === "keep"
      ? ".cm-ai-review-button-primary"
      : ".cm-ai-review-button-destructive";
  const button = canvasElement.querySelector(selector);
  expect(button).not.toBeNull();
  await userEvent.click(button as HTMLElement);
}
