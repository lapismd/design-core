export const Basic = `<script lang="ts">
 import { onDestroy } from "svelte";
 import { DeclarativeSettingsSection, WorkspaceSettingsController, type WorkspaceSettingsSection } from "@lapismd/design-core/workspace/settings";
 import { millisecondsUnits } from "@lapismd/design-core/forms/quantity-input";
 let { chooseFile }: { chooseFile: () => Promise<string | null> } = $props();
 const section: WorkspaceSettingsSection = { id: "models", title: "Models", fields: [
  { id: "delay", title: "Delay", type: "integer", default: 1000, minimum: 1, maximum: 60000, quantity: { units: millisecondsUnits, preferredUnit: "sec", slider: true } },
  { id: "path", title: "Model file", type: "string", default: "", filePicker: { browse: chooseFile } }
 ] };
 const controller = new WorkspaceSettingsController({ sections: [section] });
 onDestroy(() => controller.destroy());
</script>
<DeclarativeSettingsSection {controller} {section} />`;
