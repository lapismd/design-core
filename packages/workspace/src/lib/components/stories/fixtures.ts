import { DefaultWorkspaceViewRegistry } from "../../core/view-registry.js";
import { WorkspaceController } from "../../core/workspace-controller.svelte";
import type { WorkspaceLayoutV1, WorkspaceTab } from "../../core/types.js";
import FileTextIcon from "@lucide/svelte/icons/file-text";
import WorkspaceStoryTextView from "./WorkspaceStoryTextView.svelte";
import WorkspaceEmptyView from "../WorkspaceEmptyView.svelte";

export const demoTabs: WorkspaceTab[] = [
  {
    id: "notes",
    title: "Notes",
    view: { type: "story", state: {} },
  },
  {
    id: "details",
    title: "Details",
    view: { type: "story", state: {} },
  },
];

export function createDemoLayout(): WorkspaceLayoutV1 {
  return {
    version: 1,
    left: { open: true, size: 280, activeTabId: null, collapsedGroups: {} },
    right: { open: true, size: 280, activeTabId: null, collapsedGroups: {} },
    main: {
      kind: "split",
      id: "root",
      direction: "horizontal",
      sizes: [45, 55],
      children: [
        {
          kind: "tabs",
          id: "notes-tabs",
          activeTabId: "notes",
          presentation: "top",
          tabs: demoTabs,
        },
        {
          kind: "split",
          id: "secondary-split",
          direction: "vertical",
          sizes: [50, 50],
          children: [
            {
              kind: "tabs",
              id: "top-tabs",
              activeTabId: "details-top",
              presentation: "top",
              tabs: [
                {
                  id: "details-top",
                  title: "Top pane",
                  view: { type: "story", state: {} },
                },
              ],
            },
            {
              kind: "tabs",
              id: "bottom-tabs",
              activeTabId: "details-bottom",
              presentation: "top",
              tabs: [
                {
                  id: "details-bottom",
                  title: "Bottom pane",
                  view: { type: "story", state: {} },
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

export function createDemoController(
  layout: WorkspaceLayoutV1 = createDemoLayout(),
) {
  const registry = new DefaultWorkspaceViewRegistry();
  registry.register({
    kind: "svelte",
    type: "story",
    component: WorkspaceStoryTextView,
    icon: FileTextIcon,
  });
  registry.register({
    kind: "svelte",
    type: "empty",
    component: WorkspaceEmptyView,
    icon: FileTextIcon,
    showHeader: false,
  });
  registry.register({
    kind: "imperative",
    type: "imperative",
    mount(target) {
      target.textContent = "Imperative view mounted";
      return () => {
        target.textContent = "";
      };
    },
  });
  return new WorkspaceController({ layout, registry });
}
