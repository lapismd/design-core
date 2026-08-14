import { mergeDemoFixtures } from "./demo-fixtures.js";

/** Changeyard merge demo `quicksort-c` fixture, used to compare overlay bands. */
export const quicksortFixture = mergeDemoFixtures.find(
  (fixture) => fixture.id === "quicksort-c",
)!;
