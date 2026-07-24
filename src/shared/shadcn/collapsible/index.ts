import Root from "./collapsible.svelte";
import Trigger from "./collapsible-trigger.svelte";
import Content from "./collapsible-content.svelte";

export {
  Root,
  Content,
  Trigger,
  //
  Root as Collapsible,
  Content as CollapsibleContent,
  Trigger as CollapsibleTrigger,
};

export {
  collapsibleTokenNames,
  type CollapsibleToken,
} from "./collapsible.tokens.js";
