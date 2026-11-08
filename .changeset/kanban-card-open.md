---
"@lapismd/design-core": minor
---

Add an optional `onCardOpen` activation override and a `movesEnabled` gate to the Kanban Board. `onCardOpen` receives `(cardId, columnId)` from card clicks, the board-level Enter fallback, pinned-card clicks, and column-view opens instead of the built-in detail dialog opening. `movesEnabled={false}` disables drag lifts, drop targets, move pills, and the Shift+arrow move shortcut for read-only boards while keeping navigation and dialogs intact. The in-flow board surfaces now follow a `--kanban-board-height` custom property (default `100dvh`), letting embedded hosts bound the board to a shorter container without clipping lane borders. The family is also removed from the workspace barrel (it stays on its dedicated `./workspace/kanban` subpath) because `@dnd-kit/dom` reads `ResizeObserver` at module scope, which node and jsdom barrel consumers do not provide.
