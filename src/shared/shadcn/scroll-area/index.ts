import Scrollbar from "./scroll-area-scrollbar.svelte";
import Root from "./scroll-area.svelte";

export {
  Root,
  Scrollbar,
  //
  Root as ScrollArea,
  Scrollbar as ScrollAreaScrollbar,
};

export {
  scroll_areaTokenNames,
  type ScrollAreaToken,
} from "./scroll-area.tokens.js";

export {
  SCROLL_AREA_VISIBILITY_ATTRIBUTE,
  type ScrollAreaVisibility,
} from "./scroll-area-model.js";
