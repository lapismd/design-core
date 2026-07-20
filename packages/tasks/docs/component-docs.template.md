{/\*
Colocated Tasks component docs template (mirror forms Story + MDX).

Copy beside ComponentName.svelte as ComponentName.mdx and replace placeholders.

1. Purpose and implementation status
2. Public props / controlled state / callbacks / types
3. Anatomy and primitive provenance
4. Default, state, responsive, dark, reduced-motion examples
5. Keyboard / focus / pointer / gesture behavior
6. Accessibility and live regions
7. Target capture via referenceVisualDelta on each comparable story
8. Real play assertions (or todo-tagged intended interactions)
   _/}
   import { Canvas, Controls, Markdown, Meta, Primary } from "@storybook/addon-docs/blocks";
   import _ as ComponentStories from "./ComponentName.stories.svelte";
   import componentSpec from "../../../specs/components/component-name.md?raw";

<Meta of={ComponentStories} />

# ComponentName

Purpose and implementation status go here.

<Markdown>{componentSpec}</Markdown>

## Usage

<Primary />

## Properties

<Controls />

## States

<Canvas of={ComponentStories.Default} meta={ComponentStories} />

## Target capture

Comparable stories must set `parameters.visualDelta` via `referenceVisualDelta(...)`
so Visual Delta receives a non-empty `images` array.
