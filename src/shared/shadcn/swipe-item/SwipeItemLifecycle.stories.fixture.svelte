<script lang="ts">
  import { mount, unmount } from "svelte";
  import Owner from "./SwipeItemLifecycleOwner.stories.fixture.svelte";

  let { behavior = "remove-root" }: { behavior?: string } = $props();
  let target = $state<HTMLDivElement>();
  let events = $state<string[]>([]);

  $effect(() => {
    if (!target) return;
    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      void unmount(owner);
    };
    const owner = mount(Owner, {
      target,
      props: {
        behavior,
        onEvent: (event: string) => {
          events = [...events, event];
        },
        removeOwner: dispose,
      },
    });
    return dispose;
  });
</script>

<section class="lifecycle" aria-label="Swipe Item lifetime">
  <div bind:this={target}></div>
  <p role="status">
    {events.length ? events.join(",") : "Awaiting activation"}
  </p>
</section>

<style>
  .lifecycle {
    inline-size: min(26rem, 100%);
  }
</style>
