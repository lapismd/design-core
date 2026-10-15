import { waitFor } from "storybook/test";

export async function emojiLibrary(): Promise<HTMLElement> {
  let section: HTMLElement | null | undefined;
  await waitFor(() => {
    section = document
      .querySelector("em-emoji-picker")
      ?.shadowRoot?.querySelector<HTMLElement>("section");
    if (!section?.querySelector("input"))
      throw new Error("Waiting for the emoji library");
  });
  return section!;
}
