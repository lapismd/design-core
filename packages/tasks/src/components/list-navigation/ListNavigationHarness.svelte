<script lang="ts">
  import type {
    TasksNavDestination,
    TasksNavDestinationId,
  } from "../../lib/contracts.js";
  import { createTasksStoryFixture } from "../../lib/story-fixtures.js";
  import ListNavigation from "./ListNavigation.svelte";

  const fixture = createTasksStoryFixture();
  let destinations = $state<TasksNavDestination[]>([
    ...fixture.navDestinations,
  ]);
  let activeId = $state<TasksNavDestinationId | null>("inbox");
  let created = $state(false);
</script>

<div style="padding: 1rem">
  <ListNavigation
    {destinations}
    {activeId}
    onActivate={(id) => {
      activeId = id;
    }}
    onFavourite={(listId, favourite) => {
      destinations = destinations.map((item) =>
        item.listId === listId ? { ...item, favourite } : item,
      );
    }}
    onCreateList={() => {
      created = true;
    }}
  />
  {#if activeId}
    <p>Active {activeId}</p>
  {/if}
  {#if destinations.find((item) => item.listId === "list-reference")?.favourite}
    <p>Favourite on</p>
  {:else}
    <p>Favourite off</p>
  {/if}
  {#if created}
    <p>Create list requested</p>
  {/if}
</div>
