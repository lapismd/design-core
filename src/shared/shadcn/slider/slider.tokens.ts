export const sliderTokenNames = {
  background: "--ui-slider-background",
  foreground: "--ui-slider-foreground",
  borderColor: "--ui-slider-border-color",
  radius: "--ui-slider-radius",
  focusRingColor: "--ui-slider-focus-ring-color",
  thumbBackground: "--ui-slider-thumb-background",
} as const;

export type SliderToken =
  (typeof sliderTokenNames)[keyof typeof sliderTokenNames];
