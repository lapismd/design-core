# Source provenance

Adapted from jj-store `3998e2b0`,
`web/src/lib/ui/store-settings/StoreModelFilePicker.svelte`.
Apache-2.0, Copyright LapisMD contributors.

The shared adaptation retains manual path entry and an optional host-owned
chooser, adding pending, cancellation, stale-selection and failure handling.
Native dialogs, filters, filesystem access, import and persistence stay with
the host. See UI Forms/Guidance for composition.
