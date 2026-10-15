import { waitFor } from "storybook/test";

export async function emojiLibrary(): Promise<HTMLElement> {
  let section: HTMLElement | null | undefined;
  // The full library and dataset load asynchronously on first use, including
  // a cold dev-server import; keep the rendered-input assertion bounded.
  await waitFor(
    () => {
      section = document
        .querySelector("em-emoji-picker")
        ?.shadowRoot?.querySelector<HTMLElement>("section");
      if (!section?.querySelector("input"))
        throw new Error("Waiting for the emoji library");
    },
    { timeout: 5000 },
  );
  return section!;
}
