# Segmented selection contrast

Notes' new AI transcript passes 15 focused stories at desktop/light and
narrow/light. Dark mode then exposes nine contrast failures in the
document/classic switch (2.29:1). Its shared SegmentedControl uses the light
brand accent on the dark selection fill. Existing legacy stories still pass.

DC-FORM-017 now uses semantic form foreground for selected labels, preserving
the controlled value, keyboard behavior and selection background. The source
story compares the selected label against the same public foreground token;
both source families and Notes' exact dark family are rerun. No axe rule or
baseline is changed. Notes E-AI-039 owns final archive/browser evidence.

This is a contrast correction to the existing form contract, not a new public
extension point. Original milestone and visual-approval statuses are unchanged.
