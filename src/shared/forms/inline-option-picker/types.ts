import type { Component } from "svelte";

export type InlineOptionPickerOption = {
  value: string;
  label: string;
  icon?: Component;
  accent?: string;
};
