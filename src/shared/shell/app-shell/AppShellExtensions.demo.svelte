<script lang="ts">
  import { onDestroy } from "svelte";
  import { AppShell, AppShellController } from "./index.js";
  import { Button, buttonVariants } from "../../shadcn/button/index.js";
  import { Input } from "../../shadcn/input/index.js";
  import * as Popover from "../../shadcn/popover/index.js";
  import LayersIcon from "@lucide/svelte/icons/layers";
  import MenuIcon from "@lucide/svelte/icons/menu";
  import SearchIcon from "@lucide/svelte/icons/search";
  import "./AppShellExtensions.demo.css";

  let {
    nativeChrome = false,
    direction = "ltr",
    legacy = false,
  }: {
    nativeChrome?: boolean;
    direction?: "ltr" | "rtl";
    legacy?: boolean;
  } = $props();
  const controller = new AppShellController({
    leftCollapsed: true,
    rightWidth: 216,
    sidebarMinWidth: 160,
  });
  const activity = controller.createSidebar("activity", "right", {
    width: 200,
    minWidth: 160,
  });
  const rail = controller.createSidebar("tools", "right", {
    width: 176,
    minWidth: 120,
  });
  const inspectorCompact = $derived(
    controller.mobile.resolvedMode === "desktop" &&
      controller.right.collapsed &&
      !controller.right.previewed,
  );
  const activityCompact = $derived(
    controller.mobile.resolvedMode === "desktop" &&
      activity.collapsed &&
      !activity.previewed,
  );
  const railCompact = $derived(
    controller.mobile.resolvedMode === "desktop" &&
      rail.collapsed &&
      !rail.previewed,
  );
  let width = $state(1280);
  let main = $state<HTMLElement | null>(null);
  let target = $state<HTMLElement | null>(null);
  let targetMounted = $state(true);
  let draft = $state("Shared shell draft");
  let pageDraft = $state("Retained overlay draft");
  let menuDraft = $state("Retained menu draft");
  let menuOpen = $state(false);
  let pageOpen = $state(false);
  let childScroll = $state(false);
  let hideActivity = $state(false);
  let tool = $state("Overview");
  let saved = $state(0);
  let returnFocus = $state<HTMLElement | null>(null);
  onDestroy(() => {
    void controller.dispose();
  });
</script>

<div class="shell-extensions-controls" aria-label="Example layout controls">
  <Button variant="outline" onclick={() => (targetMounted = !targetMounted)}
    >Toggle body target</Button
  >
  <Button variant="outline" onclick={() => (width = 1280)}>Wide shell</Button>
  <Button variant="outline" onclick={() => (width = 620)}>Narrow shell</Button>
  <Button variant="outline" onclick={() => (width = 320)}>Small shell</Button>
  <Button variant="outline" onclick={() => (hideActivity = !hideActivity)}
    >Hide activity</Button
  >
  <Button variant="outline" onclick={() => activity.open()}
    >Open activity</Button
  >
  <Button variant="outline" onclick={() => activity.collapse()}
    >Collapse activity</Button
  >
  <Button variant="outline" onclick={() => activity.close()}
    >Close activity</Button
  >
  <Button variant="outline" onclick={() => (childScroll = !childScroll)}
    >Toggle page scroll owner</Button
  >
  <output data-testid="saved-count">{saved}</output>
  <output class="sr-only" data-testid="desktop-layout"
    >{JSON.stringify(controller.getLayout())}</output
  >
</div>

<div
  class="shell-extensions-demo"
  dir={direction}
  style:width={`${width}px`}
  data-native-chrome={nativeChrome || undefined}
>
  <div class="shell-extensions-top" data-testid="outer-topbar-host">
    <AppShell.Topbar
      {controller}
      mainElement={main}
      mobilePlacement={nativeChrome ? "top" : "body"}
      mobileTarget={target}
    >
      {#snippet leading()}
        <AppShell.Sidebar.Toggle
          shellController={controller}
          side="left"
          sidebarName="navigation"
        />
      {/snippet}
      {#snippet center()}<span class="shell-extensions-location"
          >Shared workspace</span
        >{/snippet}
      {#snippet trailing()}
        <Popover.Root bind:open={menuOpen}>
          <Popover.Trigger
            aria-label="Application menu"
            class={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <MenuIcon aria-hidden="true" />
          </Popover.Trigger>
          <Popover.Content aria-label="Application actions">
            <label
              >Menu draft<Input
                aria-label="Menu draft"
                bind:value={menuDraft}
              /></label
            >
          </Popover.Content>
        </Popover.Root>
      {/snippet}
    </AppShell.Topbar>
  </div>
  <AppShell.Root
    {controller}
    mobileBreakpoint={700}
    desktopMinMainWidth={360}
    style="flex:1;min-height:0"
  >
    <AppShell.Sidebar side="left" label="Navigation" closeable>
      <AppShell.Sidebar.Header
        ><LayersIcon aria-hidden="true" /></AppShell.Sidebar.Header
      >
      <AppShell.Sidebar.Body
        ><Button variant="ghost" aria-label="Home"
          ><LayersIcon aria-hidden="true" /></Button
        ></AppShell.Sidebar.Body
      >
    </AppShell.Sidebar>
    <AppShell.Main bind:ref={main} data-testid="extension-main">
      {#if targetMounted}<AppShell.Topbar.Target bind:ref={target} />{/if}
      <AppShell.Toolbar label="Document actions">
        <h1>Shared document</h1>
        <AppShell.Sidebar.Toggle side="right" sidebarName="Inspector" />
        <AppShell.Sidebar.Toggle
          side="right"
          sidebarController={activity}
          sidebarName="Activity"
        />
        <AppShell.Sidebar.Toggle
          side="right"
          sidebarController={rail}
          sidebarName="Tools"
        />
      </AppShell.Toolbar>
      <AppShell.Body label="Document">
        <div class="shell-extensions-content">
          <label
            >Document title<Input
              aria-label="Document title"
              bind:value={draft}
            /></label
          >
          <Button
            variant="outline"
            onclick={(event) => {
              returnFocus = event.currentTarget;
              pageOpen = true;
            }}>Open overlay page</Button
          >
          {#each Array.from({ length: 28 }, (_, i) => i + 1) as line}
            <p>
              Section {line}: the document and its attached panels scroll
              independently.
            </p>
          {/each}
        </div>
      </AppShell.Body>
    </AppShell.Main>
    <AppShell.Sidebar
      side="right"
      label="Inspector"
      resizeLabel="Resize inspector"
      variant={legacy ? "default" : "attached"}
      style={inspectorCompact
        ? "--ui-shell-sidebar-section-padding: 0.5rem 0.25rem"
        : undefined}
      constrainedPresentation="replace-main"
      constraintPriority={0}
      closeable
    >
      <AppShell.Sidebar.Header
        >{#if !inspectorCompact}<h2>Inspector</h2>{/if}
        <AppShell.Sidebar.Close
          label="Close inspector"
        /></AppShell.Sidebar.Header
      >
      <AppShell.Sidebar.Body>
        <AppShell.Sidebar.Section>
          {#snippet heading()}{#if !inspectorCompact}<h3>
                Document details
              </h3>{/if}{/snippet}
          {#if inspectorCompact}<Button
              variant="ghost"
              aria-label="Expand inspector"
              onclick={() => controller.right.expand()}
              ><LayersIcon aria-hidden="true" /></Button
            >{:else}
            <p>Independent inspector state and width.</p>
            <label
              >Inspector title<Input
                aria-label="Inspector title"
                bind:value={draft}
              /></label
            >
          {/if}
        </AppShell.Sidebar.Section>
      </AppShell.Sidebar.Body>
      <AppShell.Sidebar.Footer
        >{#if !inspectorCompact}Inspector footer{/if}</AppShell.Sidebar.Footer
      >
    </AppShell.Sidebar>
    <AppShell.Sidebar
      side="right"
      sidebarController={activity}
      hidden={hideActivity}
      label="Activity"
      resizeLabel="Resize activity"
      variant={legacy ? "default" : "attached"}
      style={activityCompact
        ? "--ui-shell-sidebar-section-padding: 0.5rem 0.25rem"
        : undefined}
      constraintPriority={10}
      closeable
    >
      <AppShell.Sidebar.Header
        >{#if !activityCompact}<h2>Activity</h2>{/if}
        <AppShell.Sidebar.Close
          label="Close activity panel"
        /></AppShell.Sidebar.Header
      >
      <AppShell.Sidebar.Body>
        {#if activityCompact}<AppShell.Sidebar.Section
            ><Button
              variant="ghost"
              aria-label="Expand activity"
              onclick={() => activity.expand()}
              ><LayersIcon aria-hidden="true" /></Button
            ></AppShell.Sidebar.Section
          >{:else}
          {#each Array.from({ length: 20 }, (_, i) => i + 1) as update}
            <AppShell.Sidebar.Section
              ><p>
                Update {update}: shared document revised.
              </p></AppShell.Sidebar.Section
            >
          {/each}
        {/if}
      </AppShell.Sidebar.Body>
    </AppShell.Sidebar>
    <AppShell.Sidebar
      side="right"
      sidebarController={rail}
      variant="rail"
      style={railCompact
        ? "--ui-shell-sidebar-section-padding: 0.5rem 0.25rem"
        : undefined}
      constraintPriority={100}
      label="Tools rail"
      closeable
    >
      <AppShell.Sidebar.Body>
        <AppShell.Sidebar.Section>
          {#snippet heading()}{#if !railCompact}<h2>Tools</h2>{/if}{/snippet}
          <Button
            variant="ghost"
            aria-label="Overview"
            title="Overview"
            onclick={() => (tool = "Overview")}
            ><LayersIcon
              aria-hidden="true"
            />{#if !railCompact}Overview{/if}</Button
          >
          <Button
            variant="ghost"
            aria-label="Search"
            title="Search"
            onclick={() => (tool = "Search")}
            ><SearchIcon
              aria-hidden="true"
            />{#if !railCompact}Search{/if}</Button
          >
          {#if !railCompact}<p data-testid="selected-tool">{tool}</p>{/if}
        </AppShell.Sidebar.Section>
      </AppShell.Sidebar.Body>
    </AppShell.Sidebar>
    <AppShell.SurfaceLayer
      open={pageOpen}
      label="Document review"
      coverPanelIds={["right", "activity"]}
      suspendPanelIds={["tools"]}
      mobilePlacement="root"
      {returnFocus}
      onDismiss={() => (pageOpen = false)}
    >
      <AppShell.SurfaceLayer.Header
        ><h2>Document review</h2>
        <AppShell.SurfaceLayer.Close /></AppShell.SurfaceLayer.Header
      >
      <AppShell.SurfaceLayer.Body scrollable={!childScroll}>
        <div
          class="shell-extensions-content"
          class:shell-extensions-child-scroll={childScroll}
        >
          <label
            >Review draft<Input
              aria-label="Review draft"
              bind:value={pageDraft}
            /></label
          >
          <Popover.Root>
            <Popover.Trigger class={buttonVariants({ variant: "outline" })}
              >Review options</Popover.Trigger
            >
            <Popover.Content aria-label="Review options"
              ><p>Escape closes these options first.</p></Popover.Content
            >
          </Popover.Root>
          {#each Array.from({ length: 36 }, (_, i) => i + 1) as item}<p>
              Review item {item}
            </p>{/each}
        </div>
      </AppShell.SurfaceLayer.Body>
      <AppShell.SurfaceLayer.Footer>
        <Button variant="outline" onclick={() => (pageOpen = false)}
          >Cancel review</Button
        >
        <Button
          onclick={() => {
            saved++;
            pageOpen = false;
          }}>Save review</Button
        >
      </AppShell.SurfaceLayer.Footer>
    </AppShell.SurfaceLayer>
  </AppShell.Root>
</div>
