---
"@lapismd/design-core": patch
---

Dispose the emoji selection panel immediately when its popover closes so rapid
reopening starts with fresh search state and cannot retain a closing session.
Keep emoji and status-overflow closing shells free of labels after their popup
role is removed, preserving valid accessibility through exit animations.
