# Document composer host minimum

DC-CHAT-002 consumes the existing document minimum-height token on the public
Mira editor host. Framed and document minima remain independent; the editor's
content styles, typography, indentation and selection remain stock Mira.

Desktop's Compact Composer regression found the old document token had no
consumer. The new focused host-token story uses a 42px minimum and checks the
public composer editor host, avoiding percentage parsing on CodeMirror content.
The source change sets only the existing public host minimum, with the same
6rem fallback used by the ordinary editor. No consumer selector patch or visual
baseline update is introduced.

Focused source and consumer verification follow this local source fix.

- Original host-token target: one failure (96px instead of 42px); one other
  matching host-action story passed. The first case-sensitive filter matched no
  stories and is not evidence of a pass.
- The unchanged target after: 2 passed. Complete composer family: 13 passed.
- First new story attempt failed one raw Markdown assertion; focusing Mira
  exposes its retained Markdown syntax, so the assertion now checks those exact
  authored bytes. Geometry assertion remains 42px.
- `pnpm check:types`: all four Svelte consumer checks pass, 0 errors/warnings.
- `pnpm spec:check`: 3 lanes pass.
- `pnpm test:unit`: 142 files, 914 passed.
- Broad Storybook and packed consumer qualification continue separately.
