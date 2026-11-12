export const scrollAwareChromeExample = `<script lang="ts">
  import { AppShellController, WorkspaceView } from "@lapismd/design-core/workspace/core";
  import { AppShell } from "@lapismd/design-core/workspace/app-shell";

  class NoteView extends WorkspaceView {
    getViewType() { return "note"; }
    onOpen() {
      const note = document.createElement("section");
      note.setAttribute("aria-label", "Scrollable note");
      note.style.cssText = "height:100%;overflow:auto;padding:4rem 1rem 6rem";
      for (let index = 1; index <= 60; index++) {
        const paragraph = document.createElement("p");
        paragraph.textContent = "Paragraph " + index;
        note.append(paragraph);
      }
      this.containerEl.replaceChildren(note);
    }
    onClose() { this.containerEl.replaceChildren(); }
  }

  const app = new AppShellController({
    views: [{ type: "note", factory: leaf => new NoteView(leaf) }],
  });
  app.workspace.openLeaf("note", {}, { title: "Long note" });
</script>

<div style="height:100svh">
  <AppShell.Root controller={app} disposeOnDestroy>
    <AppShell.Surface displayMode="mobile" />
  </AppShell.Root>
</div>`;
