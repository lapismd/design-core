export const accordionTokenNames = {
  background: "--ui-accordion-background",
  foreground: "--ui-accordion-foreground",
  borderColor: "--ui-accordion-border-color",
  radius: "--ui-accordion-radius",
  focusRingColor: "--ui-accordion-focus-ring-color",
} as const;

export type AccordionToken =
  (typeof accordionTokenNames)[keyof typeof accordionTokenNames];
