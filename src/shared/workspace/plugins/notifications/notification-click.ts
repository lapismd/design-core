/** Native listener follows a portalled button across Svelte event roots. */
export function notificationClick(
  node: HTMLButtonElement,
  callback: () => void,
) {
  const click = () => callback();
  node.addEventListener("click", click);
  return {
    update(next: () => void) {
      callback = next;
    },
    destroy() {
      node.removeEventListener("click", click);
    },
  };
}
