const WRAPPING_TEXT_INPUT_TYPES = new Set([
  "text",
  "email",
  "search",
  "tel",
  "url",
]);

export function wrapsTextInputType(inputType = "text"): boolean {
  return WRAPPING_TEXT_INPUT_TYPES.has(inputType);
}

export function inputModeForWrappingTextType(
  inputType = "text",
): "email" | "tel" | "url" | undefined {
  if (inputType === "email" || inputType === "tel" || inputType === "url") {
    return inputType;
  }
  return undefined;
}
