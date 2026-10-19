<script lang="ts">
  let {
    viewport,
    pinnedComposer,
  }: {
    viewport: HTMLElement | null;
    pinnedComposer: HTMLElement | null;
  } = $props();
  let visible = $state(false);
  let bottom = $state(0);
  $effect(() => {
    const node = viewport;
    const composer = pinnedComposer;
    if (!node) return;
    let frame = 0;
    const update = () => {
      visible = node.scrollHeight - node.clientHeight - node.scrollTop > 1;
      bottom = composer
        ? Math.max(
            0,
            node.getBoundingClientRect().bottom -
              composer.getBoundingClientRect().top,
          )
        : 0;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(node);
    const content = node.querySelector("ol");
    if (content) observer.observe(content);
    if (composer) observer.observe(composer);
    node.addEventListener("scroll", schedule, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      node.removeEventListener("scroll", schedule);
    };
  });
</script>

<div
  class="ui-transcript-scroll-fade"
  aria-hidden="true"
  data-visible={visible}
  style:bottom={`${bottom}px`}
></div>

<style>
  .ui-transcript-scroll-fade {
    position: absolute;
    inset-inline: 0;
    height: var(--ui-transcript-scroll-fade-size, 2rem);
    background: linear-gradient(to bottom, transparent, var(--background));
    pointer-events: none;
    z-index: 1;
    opacity: 0;
  }
  .ui-transcript-scroll-fade[data-visible="true"] {
    opacity: 1;
  }
</style>
