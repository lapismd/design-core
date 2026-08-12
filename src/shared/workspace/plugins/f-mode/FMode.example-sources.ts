export const Basic = `import { AppShellController } from "@lapismd/design-core/workspace";
import { fModePlugin } from "@lapismd/design-core/workspace/plugins/fmode";

const app = new AppShellController({
	plugins: [fModePlugin()],
});`;

export const InvalidQuery = `import { AppShellController } from "@lapismd/design-core/workspace";
import {
  FMODE_SETTING_IDS,
  fModePlugin,
} from "@lapismd/design-core/workspace/plugins/fmode";

const app = new AppShellController({
  plugins: [fModePlugin()],
  configuration: {
    values: {
      [FMODE_SETTING_IDS.alphabet]: "ab",
      [FMODE_SETTING_IDS.invalidInputBehavior]: "flash",
    },
  },
});`;

export const NoTargets = `import { AppShellController } from "@lapismd/design-core/workspace";
import { fModePlugin } from "@lapismd/design-core/workspace/plugins/fmode";

const app = new AppShellController({
  plugins: [fModePlugin()],
});

// Register hint targets in consumer content with the public data-hint-* contract.`;
