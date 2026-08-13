# Styling and themes

Design Core styling is native CSS driven by semantic tokens. Themes and consumers may customize documented tokens without depending on private DOM selectors.

## Public surface coverage

| Surface               | Public boundary | Requirement |
| --------------------- | --------------- | ----------- |
| Native CSS            | Styling         | DC-CSS-001  |
| Design tokens         | Styling         | DC-CSS-002  |
| Theme surfaces        | Theme           | DC-CSS-003  |
| Accessibility styling | Styling         | DC-CSS-004  |
| No utility leakage    | Styling         | DC-CSS-005  |
| Visually hidden text  | Styling         | DC-CSS-006  |

## DC-CSS-001 — Native CSS

**Requirement.** The Native CSS family MUST use authored CSS and shared tokens as the production styling contract.

### Acceptance details

- Consumers may override documented semantic tokens without depending on private selectors.
- Workspace view tokens MUST expose resolved primary and secondary backgrounds so movable views can preserve contrast without placement selectors.
- Styling validation must distinguish source ownership from Storybook-only presentation.

## DC-CSS-002 — Design tokens

**Requirement.** The Design tokens family MUST provide semantic custom properties for color, spacing, typography, radius, focus, and component-specific extension points.

### Acceptance details

- Consumers may override documented semantic tokens without depending on private selectors.
- Styling validation must distinguish source ownership from Storybook-only presentation.

## DC-CSS-003 — Theme surfaces

**Requirement.** The Theme surfaces family MUST apply supported visual themes through documented attributes and shared style entry points.

### Acceptance details

- Consumers may override documented semantic tokens without depending on private selectors.
- Styling validation must distinguish source ownership from Storybook-only presentation.

## DC-CSS-004 — Accessibility styling

**Requirement.** The Accessibility styling family MUST retain visible focus, forced-colors, reduced-motion, disabled, invalid, and high-contrast behavior where relevant.

### Acceptance details

- Consumers may override documented semantic tokens without depending on private selectors.
- Styling validation must distinguish source ownership from Storybook-only presentation.

## DC-CSS-005 — No utility leakage

**Requirement.** The No utility leakage family MUST keep Tailwind utility syntax out of owned production Svelte, TypeScript, and CSS sources.

### Acceptance details

- Consumers may override documented semantic tokens without depending on private selectors.
- Styling validation must distinguish source ownership from Storybook-only presentation.

## DC-CSS-006 — Visually hidden text

**Requirement.** The public runtime stylesheet MUST hide production `sr-only` content without requiring a consumer Tailwind source scan.

### Acceptance details

- Accessible names must remain available to assistive technology.
- Linked application builds must not display icon-button labels or hidden dialog headings.
