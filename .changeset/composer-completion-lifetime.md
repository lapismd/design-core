---
"@lapismd/design-core": patch
---

Fence composer completion callbacks after their owning editor is destroyed so
conversation switching and comment teardown do not read retired reactive state.
