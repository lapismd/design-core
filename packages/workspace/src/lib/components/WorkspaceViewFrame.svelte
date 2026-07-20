<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type {
    WorkspaceAction,
    WorkspaceViewBreadcrumb,
    WorkspaceViewNavigationAction,
  } from "../core/types.js";
  import WorkspaceViewHeader from "./WorkspaceViewHeader.svelte";

  let {
    title,
    icon,
    breadcrumbs = [],
    back,
    forward,
    actions = [],
    options,
    children,
  }: {
    title: string;
    icon?: Component;
    /** Optional parent locations shown before the current view title. */
    breadcrumbs?: readonly WorkspaceViewBreadcrumb[];
    back?: WorkspaceViewNavigationAction;
    forward?: WorkspaceViewNavigationAction;
    actions?: readonly WorkspaceAction[];
    /** Consumer-owned menu or controls displayed after the header actions. */
    options?: Snippet;
    children?: Snippet;
  } = $props();
</script>

<section data-ui-component="workspace" data-ui-part="view-frame">
  <WorkspaceViewHeader
    {title}
    {icon}
    {breadcrumbs}
    {back}
    {forward}
    {actions}
    {options}
  />

  <div data-ui-component="workspace" data-ui-part="view-body">
    {@render children?.()}
  </div>
</section>

<style>
  [data-ui-component="workspace"][data-ui-part="view-frame"] {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
    background: var(--background);
  }

  [data-ui-component="workspace"][data-ui-part="view-body"] {
    position: relative;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }
</style>
