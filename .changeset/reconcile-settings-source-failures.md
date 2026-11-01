---
"@lapismd/design-core": patch
---

Reconcile rejected controlled settings writes to their authoritative source value.
Keep a saved change visible after a lost acknowledgement while retaining its
inline error; fall back to the previous value if the source cannot be read.
