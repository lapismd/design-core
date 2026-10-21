<script lang="ts">
  import { onDestroy } from "svelte";
  import { millisecondsUnits } from "../../forms/quantity-input/index.js";
  import DeclarativeSettingsSection from "./DeclarativeSettingsSection.svelte";
  import { WorkspaceSettingsController } from "./settings-controller.svelte.js";
  import type { WorkspaceSettingsSection } from "./types.js";
  let calls = $state(0);
  const section: WorkspaceSettingsSection = {
    id: "inputs",
    title: "Unit and file settings",
    fields: [
      {
        id: "delay",
        title: "Delay",
        type: "integer",
        default: 1000,
        minimum: 1,
        maximum: 3600000,
        quantity: {
          units: millisecondsUnits,
          preferredUnit: "sec",
          slider: true,
          sliderMax: 60000,
        },
      },
      {
        id: "model",
        title: "Model file",
        type: "string",
        default: "/models/original.gguf",
        filePicker: {
          browse: async () => (++calls === 1 ? "/models/selected.gguf" : null),
        },
      },
    ],
  };
  const controller = new WorkspaceSettingsController({ sections: [section] });
  onDestroy(() => controller.destroy());
</script>

<div style="max-width:52rem">
  <DeclarativeSettingsSection {controller} {section} />
  <output data-testid="delay-value">{String(controller.get("delay"))}</output>
  <output data-testid="model-value">{String(controller.get("model"))}</output>
</div>
