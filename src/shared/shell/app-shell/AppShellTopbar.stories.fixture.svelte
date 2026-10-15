<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import {
    AppShell,
    AppShellController,
    type AppShellSidebarController,
  } from "./index.js";
  import { PanelToggle } from "../../shadcn/panel-toggle/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import { Input } from "../../shadcn/input/index.js";
  import { Avatar } from "../../shadcn/avatar/index.js";
  import { Badge } from "../../shadcn/badge/index.js";
  import { ResponsiveTabs } from "../../shadcn/responsive-tabs/index.js";
  import * as Tabs from "../../shadcn/tabs/index.js";
  import { MarkdownContent } from "../../chat/index.js";
  import FolderIcon from "@lucide/svelte/icons/folder";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import HouseIcon from "@lucide/svelte/icons/house";
  import GitBranchIcon from "@lucide/svelte/icons/git-branch";
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import PackageIcon from "@lucide/svelte/icons/package";
  import SearchIcon from "@lucide/svelte/icons/search";
  import MessageSquareIcon from "@lucide/svelte/icons/message-square";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import LayersIcon from "@lucide/svelte/icons/layers";
  import "./AppShellTopbar.stories.css";

  const controller = new AppShellController({
    leftWidth: 200,
    leftCollapsed: true,
    rightWidth: 224,
    sidebarMinWidth: 168,
  });
  const rail = controller.createSidebar("tools", "right", {
    width: 152,
    collapsed: true,
    minWidth: 128,
  });
  let main = $state<HTMLDivElement | null>(null);
  let reader = $state<HTMLDivElement | null>(null);
  let workspaceName = $state("Design system");
  let bodyOpen = $state(true),
    outlineOpen = $state(false),
    revision = $state(0),
    navigations = $state(0);
  let activeTab = $state("overview"),
    documentTitle = $state("Release notes"),
    tool = $state("activity"),
    search = $state("");
  const compactNav = $derived(
    controller.mobile.resolvedMode !== "mobile" &&
      controller.left.collapsed &&
      !controller.left.previewed,
  );
  const compactTools = $derived(
    controller.mobile.resolvedMode !== "mobile" &&
      rail.collapsed &&
      !rail.previewed,
  );
  const sections = [
    { value: "overview", label: "Overview", Icon: HouseIcon },
    { value: "documents", label: "Documents", Icon: FolderIcon },
    { value: "activity", label: "Activity", Icon: ActivityIcon },
    { value: "changes", label: "Changes", Icon: GitBranchIcon },
    { value: "releases", label: "Releases", Icon: PackageIcon },
  ];
  const tools = [
    { value: "search", label: "Search tools", Icon: SearchIcon },
    { value: "activity", label: "Workspace activity", Icon: ActivityIcon },
    { value: "discussion", label: "Discussion", Icon: MessageSquareIcon },
    { value: "settings", label: "Tool settings", Icon: SettingsIcon },
  ];
  const documents = Array.from({ length: 24 }, (_, i) => ({
    title: [
      "Release notes",
      "Component inventory",
      "Design principles",
      "Accessibility guide",
      "Project roadmap",
      "Interaction patterns",
    ][i % 6]!,
    folder: ["Design system", "Documentation", "Research"][i % 3]!,
    version: i + 1,
  }));
  const releaseDocument = `# A shared application shell\n\nA workspace for the things your team is building. Navigation, document panels and workspace activity stay independently accessible.\n\n> This document scrolls inside the workspace. The application header and sidebars stay in place.\n\n## This release\n\n- A consistent set of reusable controls\n- Responsive navigation for compact windows\n- Document details and workspace tools side by side\n\n| Area | Status |\n| --- | --- |\n| Navigation | Ready for review |\n| Shared controls | Ready for review |\n| Documentation | In progress |\n\n${Array.from({ length: 12 }, (_, i) => `## ${i + 1}. ${["Navigation and layout", "Shared components", "Content and collaboration"][i % 3]}\n\nKeep the interface focused on the work. Each content body has its own scroll position, so moving through a long document does not move the surrounding application.\n\n- Review the interaction in a narrow window.\n- Keep labels readable and controls reachable.\n- Share the result with the team.`).join("\n\n")}`;
  const stops = [
    controller.left.onLayoutChange(() => revision++),
    controller.right.onLayoutChange(() => revision++),
    rail.onLayoutChange(() => revision++),
    controller.onProjectionChange(() => revision++),
  ];
  onDestroy(() => {
    stops.forEach((stop) => stop());
    void controller.dispose();
  });
  function shown(panel: AppShellSidebarController): boolean {
    revision;
    return controller.mobile.resolvedMode === "mobile"
      ? controller.mobile.stage === panel.side &&
          controller.mobile.activePanelId(panel.side) ===
            controller.getPanelId(panel)
      : !panel.collapsed && !panel.closed;
  }
  function toggle(
    panel: AppShellSidebarController,
    trigger: HTMLButtonElement,
  ): void {
    if (controller.mobile.resolvedMode === "mobile") {
      const id = controller.getPanelId(panel);
      if (shown(panel)) controller.mobile.showMain();
      else controller.mobile.show(panel.side, id, trigger);
    } else panel.toggle();
  }
  function toggleInspector(trigger: HTMLButtonElement): void {
    if (controller.mobile.resolvedMode === "mobile")
      toggle(controller.right, trigger);
    else if (controller.right.closed) controller.right.open();
    else controller.right.close();
  }
  async function scrollToSection(index: number): Promise<void> {
    activeTab = "overview";
    if (controller.mobile.resolvedMode === "mobile")
      controller.mobile.showMain();
    await tick();
    reader?.querySelectorAll("h2")[index]?.scrollIntoView({ block: "start" });
  }
  function localShown(id: "details" | "outline"): boolean {
    if (controller.mobile.resolvedMode === "mobile")
      return (
        controller.mobile.stage === (id === "details" ? "right" : "left") &&
        controller.mobile.activePanelId(id === "details" ? "right" : "left") ===
          id
      );
    return id === "details" ? bodyOpen : outlineOpen;
  }
  async function toggleLocal(
    id: "details" | "outline",
    trigger: HTMLButtonElement,
  ) {
    const side = id === "details" ? "right" : "left";
    if (controller.mobile.resolvedMode === "mobile") {
      if (
        controller.mobile.stage === side &&
        controller.mobile.activePanelId(side) === id
      )
        controller.mobile.showMain();
      else {
        if (id === "details") bodyOpen = true;
        else outlineOpen = true;
        await tick();
        controller.mobile.show(side, id, trigger);
      }
    } else if (id === "details") bodyOpen = !bodyOpen;
    else outlineOpen = !outlineOpen;
  }
  function selectSection(value: string) {
    activeTab = value;
    if (controller.mobile.resolvedMode === "mobile")
      controller.mobile.showMain();
  }
  function selectTool(value: string) {
    tool = value;
    controller.right.open();
    if (controller.mobile.resolvedMode === "mobile")
      controller.mobile.show("right", controller.getPanelId(controller.right));
  }
</script>

<div class="topbar-shell-demo">
  <AppShell.Topbar
    mainElement={main}
    onBack={() => navigations++}
    canForward={false}
    onForward={() => {}}
  >
    {#snippet leading()}<PanelToggle
        side="left"
        iconVariant="standard"
        size="icon-sm"
        expanded={shown(controller.left)}
        aria-label="Toggle navigation"
        onclick={(event) => toggle(controller.left, event.currentTarget)}
      />{/snippet}
    {#snippet center()}<span
        class="topbar-shell-demo__location"
        data-testid="topbar-center"
        ><LayersIcon aria-hidden="true" /><span>Workspace overview</span
        ><ChevronDownIcon aria-hidden="true" /></span
      >{/snippet}
    {#snippet trailing()}
      <PanelToggle
        side="right"
        iconVariant="standard"
        size="icon-sm"
        expanded={shown(rail)}
        aria-label="Toggle tools rail"
        onclick={(event) => toggle(rail, event.currentTarget)}
      />
    {/snippet}
  </AppShell.Topbar>
  <AppShell.Root
    {controller}
    mobileBreakpoint={680}
    desktopMinMainWidth={360}
    style="flex:1;min-height:0"
  >
    <AppShell.Sidebar
      side="left"
      label="Project navigation"
      mobileLabel="Projects"
      revealOnEdgeHover
    >
      <AppShell.Sidebar.Header class="topbar-shell-demo__nav-header">
        <LayersIcon aria-hidden="true" />{#if !compactNav}<strong
            >Lapis workspace</strong
          >{/if}
      </AppShell.Sidebar.Header>
      <AppShell.Sidebar.Body>
        <nav
          aria-label="Workspace navigation"
          class="topbar-shell-demo__nav"
          data-compact={compactNav}
        >
          {#each sections as item (item.value)}<Button
              variant="ghost"
              aria-label={item.label}
              title={compactNav ? item.label : undefined}
              aria-current={activeTab === item.value ? "page" : undefined}
              onclick={() => selectSection(item.value)}
              ><item.Icon aria-hidden="true" />{#if !compactNav}<span
                  >{item.label}</span
                >{/if}</Button
            >{/each}
          {#if !compactNav}<span class="topbar-shell-demo__caption"
              >Projects</span
            >{/if}
          {#each ["Design system", "Documentation", "Research", "Website", "Mobile app", "Team space", "Prototypes", "Brand assets", "Platform", "Integrations", "Components", "Archive"] as project}<Button
              variant="ghost"
              aria-label={project}
              title={compactNav ? project : undefined}
              onclick={() => selectSection("documents")}
              ><FolderIcon aria-hidden="true" />{#if !compactNav}<span
                  >{project}</span
                >{/if}</Button
            >{/each}
        </nav>
      </AppShell.Sidebar.Body>
      <AppShell.Sidebar.Footer class="topbar-shell-demo__profile"
        ><Avatar
          initials="AM"
          name="Alex Morgan"
          size="sm"
          decorative
        />{#if !compactNav}<span>Alex Morgan</span
          >{/if}</AppShell.Sidebar.Footer
      >
    </AppShell.Sidebar>
    <AppShell.Main bind:ref={main}>
      <Tabs.Root bind:value={activeTab} class="topbar-shell-demo__workspace">
        <AppShell.Toolbar
          label="Document header"
          class="topbar-shell-demo__header"
        >
          <div class="topbar-shell-demo__heading-row">
            <div class="topbar-shell-demo__document-title">
              <FileTextIcon aria-hidden="true" />
              <h1>{documentTitle}</h1>
              <Badge variant="secondary">Draft</Badge>
            </div>
            <div class="topbar-shell-demo__header-actions">
              <PanelToggle
                side="right"
                iconVariant="standard"
                size="icon-sm"
                expanded={shown(controller.right)}
                aria-label="Toggle workspace inspector"
                onclick={(event) => toggleInspector(event.currentTarget)}
              />
            </div>
          </div>
          <ResponsiveTabs
            inheritContext
            bind:value={activeTab}
            items={sections}
            label="Workspace sections"
            presentation="line"
          />
        </AppShell.Toolbar>
        <AppShell.Body
          layout="regions"
          element="section"
          label="Document workspace"
        >
          <div class="topbar-shell-demo__body-toggle" data-side="left">
            <PanelToggle
              side="left"
              iconVariant="compact"
              size="icon-sm"
              expanded={localShown("outline")}
              aria-label="Toggle document outline"
              onclick={(event) =>
                void toggleLocal("outline", event.currentTarget)}
            />
          </div>
          <div class="topbar-shell-demo__body-toggle" data-side="right">
            <PanelToggle
              side="right"
              iconVariant="compact"
              size="icon-sm"
              expanded={localShown("details")}
              aria-label="Toggle document details"
              onclick={(event) =>
                void toggleLocal("details", event.currentTarget)}
            />
          </div>
          <AppShell.Body.Sidebar
            side="left"
            panelId="outline"
            bind:open={outlineOpen}
            label="Document outline"
            mobileLabel="Contents"
          >
            <div class="topbar-shell-demo__panel topbar-shell-demo__body-panel">
              <h2>On this page</h2>
              {#each ["This release", ...Array.from({ length: 12 }, (_, i) => `${i + 1}. ${["Navigation and layout", "Shared components", "Content and collaboration"][i % 3]}`)] as heading, index}<Button
                  variant="ghost"
                  onclick={() => void scrollToSection(index)}>{heading}</Button
                >{/each}
            </div>
          </AppShell.Body.Sidebar>
          <AppShell.Body.Content
            label="Workspace content"
            scrollbarVisibility="always"
          >
            <Tabs.Content
              value="overview"
              class="topbar-shell-demo__tab-content"
              ><div bind:this={reader}>
                <MarkdownContent content={releaseDocument} fullWidth />
              </div>
              <div class="topbar-shell-demo__document-action">
                <Button
                  variant="outline"
                  onclick={(event) =>
                    void toggleLocal("details", event.currentTarget)}
                  >Toggle details from document</Button
                >
              </div></Tabs.Content
            >
            <Tabs.Content
              value="documents"
              class="topbar-shell-demo__tab-content"
              ><div class="topbar-shell-demo__list-heading">
                <h2>Documents</h2>
                <span>24 documents</span>
              </div>
              {#each documents as doc, i}<Button
                  variant="ghost"
                  class="topbar-shell-demo__document-row"
                  onclick={() => {
                    documentTitle = doc.title;
                    activeTab = "overview";
                  }}
                  ><FileTextIcon aria-hidden="true" /><span
                    ><strong>{doc.title}</strong><small
                      >{doc.folder} · Version {doc.version}</small
                    ></span
                  ><span class="topbar-shell-demo__caption">{i + 1}h ago</span
                  ></Button
                >{/each}</Tabs.Content
            >
            <Tabs.Content
              value="activity"
              class="topbar-shell-demo__tab-content"
              ><h2>Recent activity</h2>
              {#each documents as doc, i}<div
                  class="topbar-shell-demo__activity"
                >
                  <Avatar initials={i % 2 ? "SK" : "AM"} size="sm" decorative />
                  <div>
                    <strong>{i % 2 ? "Sam Kim" : "Alex Morgan"}</strong>
                    <p>Updated {doc.title.toLowerCase()}</p>
                    <small>{i + 1} hours ago</small>
                  </div>
                </div>{/each}</Tabs.Content
            >
            <Tabs.Content value="changes" class="topbar-shell-demo__tab-content"
              ><h2>Changes ready for review</h2>
              {#each documents.slice(0, 16) as doc}<div
                  class="topbar-shell-demo__change"
                >
                  <GitBranchIcon aria-hidden="true" /><span>{doc.title}</span
                  ><Badge variant="outline">Updated</Badge>
                </div>{/each}</Tabs.Content
            >
            <Tabs.Content
              value="releases"
              class="topbar-shell-demo__tab-content"
              ><h2>Release history</h2>
              {#each Array.from({ length: 16 }, (_, i) => i) as i}<article
                  class="topbar-shell-demo__release"
                >
                  <span class="topbar-shell-demo__caption"
                    >October {15 - i}, 2026</span
                  >
                  <h3>Design system 0.{16 - i}</h3>
                  <p>
                    Shared controls, clearer navigation and documentation
                    improvements for the whole team.
                  </p>
                  <Badge variant="secondary">Published</Badge>
                </article>{/each}</Tabs.Content
            >
          </AppShell.Body.Content>
          <AppShell.Body.Sidebar
            side="right"
            panelId="details"
            bind:open={bodyOpen}
            label="Document details"
            mobileLabel="Document details"
          >
            <div class="topbar-shell-demo__panel topbar-shell-demo__body-panel">
              <h2>Document details</h2>
              <label
                >Document title<Input
                  aria-label="Document title"
                  bind:value={documentTitle}
                /></label
              >
              <dl>
                <dt>Status</dt>
                <dd><Badge variant="outline">In review</Badge></dd>
                <dt>Collection</dt>
                <dd>Design system</dd>
                <dt>Updated by</dt>
                <dd>Alex Morgan</dd>
                <dt>Last updated</dt>
                <dd>Today at 10:42</dd>
              </dl>
              <h3>Checklist</h3>
              {#each ["Review navigation", "Check narrow layouts", "Confirm labels", "Review empty states", "Update documentation", "Share with the team", "Check keyboard access", "Confirm colours", "Review mobile flow", "Publish release notes"] as task}<div
                  class="topbar-shell-demo__task"
                >
                  <CheckIcon aria-hidden="true" /><span>{task}</span>
                </div>{/each}
            </div>
          </AppShell.Body.Sidebar>
        </AppShell.Body>
      </Tabs.Root>
      <div class="topbar-shell-demo__status">
        <span><CheckIcon aria-hidden="true" />All changes saved</span><span
          >Markdown · UTF-8</span
        >
      </div>
    </AppShell.Main>
    <AppShell.Sidebar
      side="right"
      label="Workspace inspector"
      mobileLabel="Workspace"
      closeable
      class="topbar-shell-demo__inspector"
      resizeLabel="Resize workspace inspector"
    >
      <AppShell.Sidebar.Header class="topbar-shell-demo__inspector-header"
        ><h2>{tool === "search" ? "Search workspace" : "Workspace"}</h2>
        <AppShell.Sidebar.Close
          label="Close workspace inspector"
        /></AppShell.Sidebar.Header
      >
      <AppShell.Sidebar.Body
        ><div class="topbar-shell-demo__panel">
          {#if tool === "search"}<Input
              aria-label="Search workspace"
              placeholder="Search documents…"
              bind:value={search}
            />{#each documents.filter((doc) => doc.title
                .toLowerCase()
                .includes(search.toLowerCase())) as doc}<Button
                variant="ghost"
                onclick={() => {
                  documentTitle = doc.title;
                  activeTab = "overview";
                }}>{doc.title}</Button
              >{/each}
          {:else if tool === "settings"}
            <h3>Workspace settings</h3>
            <label
              >Workspace name<Input
                bind:value={workspaceName}
                aria-label="Workspace name"
              /></label
            >
            <p class="topbar-shell-demo__caption">
              Configure this workspace's display name.
            </p>
          {:else}<div class="topbar-shell-demo__workspace-summary">
              <LayersIcon aria-hidden="true" /><strong>Design system</strong
              ><span>12 members · 24 documents</span>
            </div>
            <h3>
              {tool === "discussion"
                ? "Team discussion"
                : tool === "settings"
                  ? "Workspace settings"
                  : "Team activity"}
            </h3>
            {#each documents.slice(0, 18) as doc, i}<div
                class="topbar-shell-demo__inspector-event"
              >
                <Avatar initials={i % 2 ? "SK" : "AM"} size="xs" decorative />
                <div>
                  <strong>{i % 2 ? "Sam" : "Alex"}</strong>
                  <p>
                    {tool === "discussion" ? "Left a comment on" : "Updated"}
                    {doc.title.toLowerCase()}
                  </p>
                  <small>{i + 1}h ago</small>
                </div>
              </div>{/each}{/if}
        </div></AppShell.Sidebar.Body
      >
      <AppShell.Sidebar.Footer class="topbar-shell-demo__inspector-footer"
        ><span>Navigation visits</span><output data-testid="back-count"
          >{navigations}</output
        ></AppShell.Sidebar.Footer
      >
    </AppShell.Sidebar>
    <AppShell.Sidebar
      side="right"
      sidebarController={rail}
      variant="rail"
      label="Tools rail"
      mobileLabel="Tools"
      revealOnEdgeHover
    >
      <AppShell.Sidebar.Body
        ><div class="topbar-shell-demo__tools" data-compact={compactTools}>
          {#each tools as item}<Button
              variant="ghost"
              aria-label={item.label}
              title={compactTools ? item.label : undefined}
              onclick={() => selectTool(item.value)}
              ><item.Icon aria-hidden="true" />{#if !compactTools}<span
                  >{item.label}</span
                >{/if}</Button
            >{/each}
        </div></AppShell.Sidebar.Body
      >
    </AppShell.Sidebar>
  </AppShell.Root>
</div>
