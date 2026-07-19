import { styleText } from "node:util";

export const log = {
  info(message: string) {
    console.log(message);
  },
  ok(message: string) {
    console.log(styleText("green", `✓ ${message}`));
  },
  fail(message: string) {
    console.error(styleText("red", `✗ ${message}`));
  },
  warn(message: string) {
    console.warn(styleText("yellow", `! ${message}`));
  },
  step(message: string) {
    console.log(styleText("cyan", `→ ${message}`));
  },
};
