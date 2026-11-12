import type { WorkspaceSide } from "./types.js";

/** Controller-owned mobile presentation state; never serialized into layout. */
export class WorkspaceMobileNavigation {
  page = $state<"editor" | "tabs">("editor");
  reveal = $state<"left" | "center" | "right">("center");
  menuOpen = $state(false);
  chromeHidden = $state(false);
  #initialized = false;
  #scrollTop = 0;

  initialize(defaultPage: "editor" | "tabs"): void {
    if (this.#initialized) return;
    this.#initialized = true;
    this.page = defaultPage;
  }

  showChrome(): void {
    this.chromeHidden = false;
    this.#scrollTop = 0;
  }

  closeOverlays(): void {
    this.menuOpen = false;
    this.reveal = "center";
    this.showChrome();
  }

  openEditor(): void {
    this.page = "editor";
    this.closeOverlays();
  }

  openTabs(): void {
    this.page = "tabs";
    this.closeOverlays();
  }

  openSidebar(side: WorkspaceSide): void {
    this.openEditor();
    this.reveal = side;
  }

  openMenu(): void {
    this.openEditor();
    this.menuOpen = true;
  }

  updateScroll(scrollTop: number): void {
    const next = Math.max(0, scrollTop);
    if (this.menuOpen || this.reveal !== "center" || next <= 8) {
      this.chromeHidden = false;
    } else if (Math.abs(next - this.#scrollTop) > 12) {
      this.chromeHidden = next > this.#scrollTop;
    }
    this.#scrollTop = next;
  }
}
