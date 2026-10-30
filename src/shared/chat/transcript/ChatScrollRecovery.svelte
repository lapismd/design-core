<script lang="ts">
  import LayoutScrollButton from "../../ai/layout-scroll-button/LayoutScrollButton.svelte";
  let {
    viewport,
    pinnedComposer,
    running,
    followingAllowed,
  }: {
    viewport: HTMLElement | null;
    pinnedComposer: HTMLElement | null;
    running: boolean;
    followingAllowed: boolean;
  } = $props();
  let visible = $state(false),
    bottom = $state(0);
  let following = false;
  let previousTop = 0;
  const atEnd = (node: HTMLElement) =>
    node.scrollHeight - node.clientHeight - node.scrollTop <= 8;
  function measure(node: HTMLElement, composer: HTMLElement | null) {
    visible = !atEnd(node);
    bottom = composer
      ? Math.max(
          0,
          node.getBoundingClientRect().bottom -
            composer.getBoundingClientRect().top,
        )
      : 0;
  }
  $effect(() => {
    const node = viewport,
      composer = pinnedComposer;
    if (!node) return;
    let frame = 0;
    previousTop = node.scrollTop;
    following = atEnd(node);
    const scrolled = () => {
      const top = node.scrollTop;
      // A delayed jump event can arrive after content has grown. Only actual
      // upward movement releases following; changed height alone does not.
      following = atEnd(node) || (following && top >= previousTop);
      previousTop = top;
      measure(node, composer);
    };
    const resized = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (following && followingAllowed) node.scrollTop = node.scrollHeight;
        measure(node, composer);
      });
    };
    const observer = new ResizeObserver(resized);
    observer.observe(node);
    const content = node.querySelector(".ui-transcript-composer-flow");
    // Document flow uses display:contents. Watch its boxed sections as well
    // as the Classic flow; the readers may change size without new item data.
    const watched = new Set<Element>();
    const watchSections = () => {
      const sections = new Set(content?.children ?? []);
      for (const section of watched)
        if (!sections.has(section)) {
          observer.unobserve(section);
          watched.delete(section);
        }
      for (const section of sections)
        if (!watched.has(section)) {
          observer.observe(section);
          watched.add(section);
        }
      resized();
    };
    if (content) observer.observe(content);
    watchSections();
    const mutation = new MutationObserver(watchSections);
    if (content) mutation.observe(content, { childList: true });
    if (composer) observer.observe(composer);
    node.addEventListener("scroll", scrolled, { passive: true });
    measure(node, composer);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutation.disconnect();
      node.removeEventListener("scroll", scrolled);
    };
  });
  function latest() {
    const node = viewport;
    if (!node) return;
    following = true;
    node.scrollTo({ top: node.scrollHeight, behavior: "instant" });
    previousTop = node.scrollTop;
    const draft = node.querySelector<HTMLElement>(
      "[data-transcript-composer] :is([role='textbox'], textarea):not([aria-readonly='true']):not([contenteditable='false']):not(:disabled):not([aria-disabled='true'])",
    );
    (
      draft ?? node.querySelector<HTMLElement>("[data-chat-item]:last-child")
    )?.focus({ preventScroll: true });
    measure(node, pinnedComposer);
  }
</script>

<div
  class="recovery"
  style:--ui-ai-chat-scroll-button-bottom={`calc(${bottom}px + 0.75rem)`}
>
  <LayoutScrollButton
    isVisible={visible}
    isRunning={running}
    onClick={latest}
  />
</div>

<style>
  .recovery {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 0;
  }
</style>
