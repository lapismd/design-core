export const FullShowcase = `<script lang="ts">
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";
	import { Badge } from "@lapismd/design-core/shadcn/badge";
	import { Progress } from "@lapismd/design-core/shadcn/progress";

	const canvas = ColumnCanvas.createColumnCanvasController({
		columns: {
			workspaces: { defaultWidth: 280, pathLevel: 0, collapsible: true, resizable: true },
			projects: { defaultWidth: 320, pathLevel: 1, collapsible: true, resizable: true, closeable: true },
			boards: { defaultWidth: 300, pathLevel: 2, collapsible: true, resizable: true, closeable: true },
			tasks: { defaultWidth: 380, pathLevel: 3, collapsible: true, resizable: true, closeable: true },
			detail: { defaultWidth: 440, pathLevel: 4, collapsible: true, resizable: true, closeable: true },
			activity: { defaultWidth: 340, pathLevel: 4, collapsible: true, resizable: true, closeable: true },
		},
		initialPath: ["lapis", "design-core", "column-canvas", "showcase"],
	});

	const workspaces = [
		{
			id: "lapis",
			label: "Lapis workspace",
			projects: [
				{
					id: "design-core",
					label: "Design Core",
					boards: [
						{
							id: "column-canvas",
							label: "Column Canvas",
							tasks: [
								{
									id: "showcase",
									key: "DC-184",
									title: "Build the complete Column Canvas showcase",
									status: "In progress",
									progress: 68,
									activity: ["Moved to In progress", "Added browser coverage"],
								},
							],
						},
					],
				},
			],
		},
	];

	const workspace = $derived(workspaces.find((item) => item.id === canvas.path[0]));
	const project = $derived(workspace?.projects.find((item) => item.id === canvas.path[1]));
	const board = $derived(project?.boards.find((item) => item.id === canvas.path[2]));
	const task = $derived(board?.tasks.find((item) => item.id === canvas.path[3]));
</script>

<div style="height:650px">
	<ColumnCanvas.Root controller={canvas} aria-label="Product delivery workspace">
		<ColumnCanvas.Column id="workspaces" title="Workspaces" count={workspaces.length} sticky>
			{#snippet stickyRail()}<ArrowLeft data-icon="inline-start" aria-hidden="true" />{/snippet}
			<ColumnCanvas.Body>
				{#each workspaces as item (item.id)}
					<ColumnCanvas.Item selected={canvas.isSelected(0, item.id)} onclick={() => canvas.select(0, item.id)}>
						{item.label}
					</ColumnCanvas.Item>
				{/each}
			</ColumnCanvas.Body>
		</ColumnCanvas.Column>

		<ColumnCanvas.Column id="projects" title="Projects" count={workspace?.projects.length} sticky>
			{#snippet stickyRail()}<ArrowLeft data-icon="inline-start" aria-hidden="true" />{/snippet}
			<ColumnCanvas.Body>
				{#each workspace?.projects ?? [] as item (item.id)}
					<ColumnCanvas.Item selected={canvas.isSelected(1, item.id)} onclick={() => canvas.select(1, item.id)}>
						{item.label}
					</ColumnCanvas.Item>
				{/each}
			</ColumnCanvas.Body>
		</ColumnCanvas.Column>

		<ColumnCanvas.Column id="boards" title={project?.label ?? "Boards"} count={project?.boards.length}>
			<ColumnCanvas.Body>
				{#each project?.boards ?? [] as item (item.id)}
					<ColumnCanvas.Item selected={canvas.isSelected(2, item.id)} onclick={() => canvas.select(2, item.id)}>
						{item.label}
					</ColumnCanvas.Item>
				{/each}
			</ColumnCanvas.Body>
		</ColumnCanvas.Column>

		<ColumnCanvas.Column id="tasks" title="Tasks" count={board?.tasks.length}>
			<ColumnCanvas.Body>
				{#each board?.tasks ?? [] as item (item.id)}
					<ColumnCanvas.Item selected={canvas.isSelected(3, item.id)} onclick={() => canvas.select(3, item.id)}>
						<Badge variant="outline">{item.key}</Badge>
						{item.title}
					</ColumnCanvas.Item>
				{/each}
			</ColumnCanvas.Body>
		</ColumnCanvas.Column>

		<ColumnCanvas.Column id="detail" title="Task details">
			<ColumnCanvas.Body>
				{#if task}
					<h2>{task.title}</h2>
					<Badge>{task.status}</Badge>
					<Progress value={task.progress} aria-label="Task completion" />
				{/if}
			</ColumnCanvas.Body>
		</ColumnCanvas.Column>

		<ColumnCanvas.Column id="activity" title="Activity" count={task?.activity.length}>
			<ColumnCanvas.Body>
				{#each task?.activity ?? [] as update (update)}
					<ColumnCanvas.Item disabled>{update}</ColumnCanvas.Item>
				{/each}
			</ColumnCanvas.Body>
		</ColumnCanvas.Column>
	</ColumnCanvas.Root>
</div>`;

export const Basic =
  '<script lang="ts">\n\timport * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";\n\n\tconst canvas = ColumnCanvas.createColumnCanvasController({\n\t\tcolumns: {\n\t\t\tcategories: {\n\t\t\t\tdefaultWidth: 260,\n\t\t\t\tpathLevel: 0,\n\t\t\t\tminWidth: 220,\n\t\t\t\tmaxWidth: 420,\n\t\t\t\tcollapsible: true,\n\t\t\t\tresizable: true,\n\t\t\t},\n\t\t\tcomponents: {\n\t\t\t\tdefaultWidth: 300,\n\t\t\t\tpathLevel: 1,\n\t\t\t\tminWidth: 240,\n\t\t\t\tmaxWidth: 480,\n\t\t\t\tcollapsible: true,\n\t\t\t\tresizable: true,\n\t\t\t},\n\t\t\tdetail: {\n\t\t\t\tdefaultWidth: 340,\n\t\t\t\tpathLevel: 2,\n\t\t\t\tminWidth: 280,\n\t\t\t\tmaxWidth: 520,\n\t\t\t\tcollapsible: true,\n\t\t\t\tresizable: true,\n\t\t\t\tcloseable: true,\n\t\t\t},\n\t\t},\n\t\tinitialPath: ["stable-chat", "composer"],\n\t});\n\n\tconst categories = [\n\t\t{\n\t\t\tid: "stable-chat",\n\t\t\tlabel: "Stable Chat",\n\t\t\tdescription: "Prop-driven chat surfaces for production hosts.",\n\t\t\tcomponents: [\n\t\t\t\t{\n\t\t\t\t\tid: "layout",\n\t\t\t\t\tlabel: "Layout",\n\t\t\t\t\trole: "Full-page chat shell with docked composer.",\n\t\t\t\t\timportPath: "@lapismd/design-core/ai/chat",\n\t\t\t\t},\n\t\t\t\t{\n\t\t\t\t\tid: "message-bubble",\n\t\t\t\t\tlabel: "Message Bubble",\n\t\t\t\t\trole: "Filled or ghost content container.",\n\t\t\t\t\timportPath: "@lapismd/design-core/ai/chat",\n\t\t\t\t},\n\t\t\t\t{\n\t\t\t\t\tid: "composer",\n\t\t\t\t\tlabel: "Composer",\n\t\t\t\t\trole: "Layout shell for composer slots and send.",\n\t\t\t\t\timportPath: "@lapismd/design-core/ai/chat",\n\t\t\t\t},\n\t\t\t\t{\n\t\t\t\t\tid: "tool-calls",\n\t\t\t\t\tlabel: "Tool Calls",\n\t\t\t\t\trole: "LLM tool and function-call activity.",\n\t\t\t\t\timportPath: "@lapismd/design-core/ai/chat",\n\t\t\t\t},\n\t\t\t],\n\t\t},\n\t\t{\n\t\t\tid: "experimental-chat",\n\t\t\tlabel: "Experimental",\n\t\t\tdescription: "Lab-derived Chat surfaces marked @experimental.",\n\t\t\tcomponents: [\n\t\t\t\t{\n\t\t\t\t\tid: "reasoning",\n\t\t\t\t\tlabel: "Reasoning",\n\t\t\t\t\trole: "Compact streaming reasoning disclosure.",\n\t\t\t\t\timportPath: "@lapismd/design-core/ai/experimental",\n\t\t\t\t},\n\t\t\t\t{\n\t\t\t\t\tid: "reaction-bar",\n\t\t\t\t\tlabel: "Reaction Bar",\n\t\t\t\t\trole: "Independently pressed reaction pills.",\n\t\t\t\t\timportPath: "@lapismd/design-core/ai/experimental",\n\t\t\t\t},\n\t\t\t],\n\t\t},\n\t];\n\n\tconst selectedCategory = $derived(categories.find((category) => category.id === canvas.path[0]));\n\tconst selectedComponent = $derived(\n\t\tselectedCategory?.components.find((component) => component.id === canvas.path[1]),\n\t);\n\tconst detailFields = $derived(\n\t\tselectedCategory && selectedComponent\n\t\t\t? [\n\t\t\t\t\t{ id: "name", label: "Name", value: selectedComponent.label },\n\t\t\t\t\t{ id: "id", label: "Id", value: selectedComponent.id },\n\t\t\t\t\t{ id: "role", label: "Role", value: selectedComponent.role },\n\t\t\t\t\t{ id: "import", label: "Import", value: selectedComponent.importPath },\n\t\t\t\t\t{ id: "category", label: "Category", value: selectedCategory.label },\n\t\t\t\t]\n\t\t\t: [],\n\t);\n</script>\n\n<button type="button" onclick={() => canvas.open("detail")}>Open detail</button>\n\n<div style="height: 460px">\n\t<ColumnCanvas.Root controller={canvas}>\n\t\t<ColumnCanvas.Column id="categories" title="Categories" count={categories.length}>\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#each categories as category (category.id)}\n\t\t\t\t\t<ColumnCanvas.Item\n\t\t\t\t\t\taria-label={category.label}\n\t\t\t\t\t\tselected={canvas.isSelected(0, category.id)}\n\t\t\t\t\t\tonclick={() => canvas.select(0, category.id)}\n\t\t\t\t\t>\n\t\t\t\t\t\t<strong>{category.label}</strong>\n\t\t\t\t\t\t<span style="display:block;font-size:0.75rem;opacity:0.7">{category.description}</span>\n\t\t\t\t\t</ColumnCanvas.Item>\n\t\t\t\t{/each}\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\n\t\t<ColumnCanvas.Column\n\t\t\tid="components"\n\t\t\ttitle={selectedCategory?.label ?? "Components"}\n\t\t\tcount={selectedCategory?.components.length}\n\t\t>\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#each selectedCategory?.components ?? [] as component (component.id)}\n\t\t\t\t\t<ColumnCanvas.Item\n\t\t\t\t\t\taria-label={component.label}\n\t\t\t\t\t\tselected={canvas.isSelected(1, component.id)}\n\t\t\t\t\t\tonclick={() => canvas.select(1, component.id)}\n\t\t\t\t\t>\n\t\t\t\t\t\t<strong>{component.label}</strong>\n\t\t\t\t\t\t<span style="display:block;font-size:0.75rem;opacity:0.7">{component.role}</span>\n\t\t\t\t\t</ColumnCanvas.Item>\n\t\t\t\t{/each}\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\n\t\t<ColumnCanvas.Column id="detail" title="Details" count={detailFields.length || undefined}>\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#each detailFields as field (field.id)}\n\t\t\t\t\t<ColumnCanvas.Item aria-label={field.label} disabled>\n\t\t\t\t\t\t<span style="display:block;font-size:0.75rem;opacity:0.7">{field.label}</span>\n\t\t\t\t\t\t<strong style="word-break:break-all">{field.value}</strong>\n\t\t\t\t\t</ColumnCanvas.Item>\n\t\t\t\t{/each}\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\t</ColumnCanvas.Root>\n</div>';

export const ThreeLevel =
  '<script lang="ts">\n\timport * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";\n\n\tconst canvas = ColumnCanvas.createColumnCanvasController({\n\t\tcolumns: {\n\t\t\tcategories: { defaultWidth: 260, pathLevel: 0, collapsible: true },\n\t\t\tcomponents: { defaultWidth: 300, pathLevel: 1, collapsible: true },\n\t\t\tdetail: { defaultWidth: 340, pathLevel: 2, closeable: true },\n\t\t},\n\t});\n\n\tconst categories = [\n\t\t{\n\t\t\tid: "stable-chat",\n\t\t\tlabel: "Stable Chat",\n\t\t\tdescription: "Prop-driven chat surfaces for production hosts.",\n\t\t\tcomponents: [\n\t\t\t\t{\n\t\t\t\t\tid: "composer",\n\t\t\t\t\tlabel: "Composer",\n\t\t\t\t\trole: "Layout shell for composer slots, drawer, input, and send actions.",\n\t\t\t\t\timportPath: "@lapismd/design-core/ai/chat",\n\t\t\t\t},\n\t\t\t\t{\n\t\t\t\t\tid: "tool-calls",\n\t\t\t\t\tlabel: "Tool Calls",\n\t\t\t\t\trole: "LLM tool and function-call activity with single or stacked summaries.",\n\t\t\t\t\timportPath: "@lapismd/design-core/ai/chat",\n\t\t\t\t},\n\t\t\t],\n\t\t},\n\t\t{\n\t\t\tid: "experimental-chat",\n\t\t\tlabel: "Experimental",\n\t\t\tdescription: "Lab-derived Chat surfaces marked @experimental.",\n\t\t\tcomponents: [\n\t\t\t\t{\n\t\t\t\t\tid: "reasoning",\n\t\t\t\t\tlabel: "Reasoning",\n\t\t\t\t\trole: "Compact streaming reasoning disclosure with controlled expansion.",\n\t\t\t\t\timportPath: "@lapismd/design-core/ai/experimental",\n\t\t\t\t},\n\t\t\t],\n\t\t},\n\t];\n\n\tconst selectedCategory = $derived(categories.find((category) => category.id === canvas.path[0]));\n\tconst selectedComponent = $derived(\n\t\tselectedCategory?.components.find((component) => component.id === canvas.path[1]),\n\t);\n</script>\n\n<div style="height: 440px">\n\t<ColumnCanvas.Root controller={canvas}>\n\t\t<ColumnCanvas.Column id="categories" title="Categories" count={categories.length}>\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#each categories as category (category.id)}\n\t\t\t\t\t<ColumnCanvas.Item\n\t\t\t\t\t\taria-label={category.label}\n\t\t\t\t\t\tselected={canvas.isSelected(0, category.id)}\n\t\t\t\t\t\tonclick={() => canvas.select(0, category.id)}\n\t\t\t\t\t>\n\t\t\t\t\t\t{category.label}\n\t\t\t\t\t</ColumnCanvas.Item>\n\t\t\t\t{/each}\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\n\t\t<ColumnCanvas.Column\n\t\t\tid="components"\n\t\t\ttitle={selectedCategory?.label ?? "Components"}\n\t\t\tcount={selectedCategory?.components.length}\n\t\t>\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#each selectedCategory?.components ?? [] as component (component.id)}\n\t\t\t\t\t<ColumnCanvas.Item\n\t\t\t\t\t\taria-label={component.label}\n\t\t\t\t\t\tselected={canvas.isSelected(1, component.id)}\n\t\t\t\t\t\tonclick={() => canvas.select(1, component.id)}\n\t\t\t\t\t>\n\t\t\t\t\t\t{component.label}\n\t\t\t\t\t</ColumnCanvas.Item>\n\t\t\t\t{/each}\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\n\t\t<ColumnCanvas.Column id="detail" title={selectedComponent?.label ?? "Detail"}>\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#if selectedComponent}\n\t\t\t\t\t<p>{selectedComponent.role}</p>\n\t\t\t\t\t<code>{selectedComponent.importPath}</code>\n\t\t\t\t{/if}\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\t</ColumnCanvas.Root>\n</div>';

export const CollapseAndExpand =
  '<script lang="ts">\n\timport * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";\n\n\tconst canvas = ColumnCanvas.createColumnCanvasController({\n\t\tcolumns: {\n\t\t\tcomponents: { defaultWidth: 320, collapsible: true },\n\t\t},\n\t});\n\n\tconst components = [\n\t\t{ id: "layout", label: "Layout", role: "Full-page chat shell with docked composer." },\n\t\t{ id: "message-bubble", label: "Message Bubble", role: "Filled or ghost content container." },\n\t\t{ id: "composer", label: "Composer", role: "Layout shell for composer slots and send." },\n\t\t{ id: "tool-calls", label: "Tool Calls", role: "LLM tool and function-call activity." },\n\t];\n</script>\n\n<div style="height: 420px">\n\t<ColumnCanvas.Root controller={canvas}>\n\t\t<ColumnCanvas.Column id="components" title="Components" count={components.length}>\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#each components as component (component.id)}\n\t\t\t\t\t<ColumnCanvas.Item aria-label={component.label}>\n\t\t\t\t\t\t<strong>{component.label}</strong>\n\t\t\t\t\t\t<span style="display:block;font-size:0.75rem;opacity:0.7">{component.role}</span>\n\t\t\t\t\t</ColumnCanvas.Item>\n\t\t\t\t{/each}\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\t</ColumnCanvas.Root>\n</div>';

export const Closeable =
  '<script lang="ts">\n\timport * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";\n\n\tconst canvas = ColumnCanvas.createColumnCanvasController({\n\t\tcolumns: {\n\t\t\tcomponents: { defaultWidth: 300, pathLevel: 0, collapsible: true },\n\t\t\tdetail: { defaultWidth: 360, pathLevel: 1, closeable: true },\n\t\t},\n\t});\n\n\tconst components = [\n\t\t{\n\t\t\tid: "message-bubble",\n\t\t\tlabel: "Message Bubble",\n\t\t\trole: "Filled or ghost content container styled from sender context.",\n\t\t\timportPath: "@lapismd/design-core/ai/chat",\n\t\t},\n\t\t{\n\t\t\tid: "composer",\n\t\t\tlabel: "Composer",\n\t\t\trole: "Layout shell for composer slots, drawer, input, and send actions.",\n\t\t\timportPath: "@lapismd/design-core/ai/chat",\n\t\t},\n\t];\n\n\tconst selected = $derived(components.find((component) => component.id === canvas.path[0]));\n</script>\n\n<button type="button" onclick={() => canvas.open("detail")}>Open detail</button>\n\n<div style="height: 420px">\n\t<ColumnCanvas.Root controller={canvas}>\n\t\t<ColumnCanvas.Column id="components" title="Stable Chat" count={components.length}>\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#each components as component (component.id)}\n\t\t\t\t\t<ColumnCanvas.Item\n\t\t\t\t\t\taria-label={component.label}\n\t\t\t\t\t\tonclick={() => canvas.select(0, component.id)}\n\t\t\t\t\t>\n\t\t\t\t\t\t{component.label}\n\t\t\t\t\t</ColumnCanvas.Item>\n\t\t\t\t{/each}\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\n\t\t<ColumnCanvas.Column id="detail" title="Detail">\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#if selected}\n\t\t\t\t\t<p>{selected.role}</p>\n\t\t\t\t\t<code>{selected.importPath}</code>\n\t\t\t\t{/if}\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\t</ColumnCanvas.Root>\n</div>';

export const Resizable =
  '<script lang="ts">\n\timport * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";\n\n\tconst canvas = ColumnCanvas.createColumnCanvasController({\n\t\tcolumns: {\n\t\t\tcomponents: {\n\t\t\t\tdefaultWidth: 300,\n\t\t\t\tminWidth: 240,\n\t\t\t\tmaxWidth: 480,\n\t\t\t\tresizable: true,\n\t\t\t},\n\t\t},\n\t});\n\n\tconst components = [\n\t\t{ id: "layout", label: "Layout" },\n\t\t{ id: "message-list", label: "Message List" },\n\t\t{ id: "composer", label: "Composer" },\n\t\t{ id: "tool-calls", label: "Tool Calls" },\n\t];\n</script>\n\n<div style="height: 420px">\n\t<ColumnCanvas.Root controller={canvas}>\n\t\t<ColumnCanvas.Column id="components" title="Components" count={components.length}>\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#each components as component (component.id)}\n\t\t\t\t\t<ColumnCanvas.Item>{component.label}</ColumnCanvas.Item>\n\t\t\t\t{/each}\n\t\t\t\t<p>Drag the trailing edge to resize. Width: {canvas.getWidth("components")}px</p>\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\t</ColumnCanvas.Root>\n</div>';

export const PersistedWidths =
  '<script lang="ts">\n\timport * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";\n\n\tconst canvas = ColumnCanvas.createColumnCanvasController({\n\t\tcolumns: {\n\t\t\tcomponents: {\n\t\t\t\tdefaultWidth: 300,\n\t\t\t\tresizable: true,\n\t\t\t\tcollapsible: true,\n\t\t\t},\n\t\t},\n\t\tpersistence: ColumnCanvas.createLocalStorageColumnCanvasLayoutPersistence(\n\t\t\t"demo/column-canvas",\n\t\t),\n\t});\n\n\tconst components = [\n\t\t{ id: "layout", label: "Layout" },\n\t\t{ id: "message-list", label: "Message List" },\n\t\t{ id: "composer", label: "Composer" },\n\t\t{ id: "tool-calls", label: "Tool Calls" },\n\t];\n</script>\n\n<div style="height: 420px">\n\t<ColumnCanvas.Root controller={canvas}>\n\t\t<ColumnCanvas.Column id="components" title="Components" count={components.length}>\n\t\t\t<ColumnCanvas.Body>\n\t\t\t\t{#each components as component (component.id)}\n\t\t\t\t\t<ColumnCanvas.Item>{component.label}</ColumnCanvas.Item>\n\t\t\t\t{/each}\n\t\t\t\t<p>Widths and collapse restore from the persistence adapter.</p>\n\t\t\t</ColumnCanvas.Body>\n\t\t</ColumnCanvas.Column>\n\t</ColumnCanvas.Root>\n</div>';

export const ResponsiveAdaptive =
  '<script lang="ts">\n\timport * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";\n\n\tconst canvas = ColumnCanvas.createColumnCanvasController({\n\t\tcolumns: {\n\t\t\tcategories: { defaultWidth: 260, pathLevel: 0, resizable: true },\n\t\t\tcomponents: { defaultWidth: 340, pathLevel: 1, resizable: true },\n\t\t\tdetail: { defaultWidth: 380, pathLevel: 2, resizable: true },\n\t\t},\n\t\tinitialPath: ["stable-chat", "composer"],\n\t});\n</script>\n\n<div style="height:460px;width:100%;max-width:1100px">\n\t<ColumnCanvas.Root controller={canvas}>\n\t\t<ColumnCanvas.Column id="categories" title="Categories"><ColumnCanvas.Body /></ColumnCanvas.Column>\n\t\t<ColumnCanvas.Column id="components" title="Components"><ColumnCanvas.Body /></ColumnCanvas.Column>\n\t\t<ColumnCanvas.Column id="detail" title="Detail"><ColumnCanvas.Body /></ColumnCanvas.Column>\n\t</ColumnCanvas.Root>\n</div>';

export const FixedCompatibility =
  '<ColumnCanvas.Root controller={canvas} displayMode="fixed">\n\t<!-- Durable pixel widths, resize handles, trailing spacer, and free scrolling stay unchanged. -->\n</ColumnCanvas.Root>';

export const StickyFloating =
  '<script lang="ts">\n\timport ArrowLeft from "@lucide/svelte/icons/arrow-left";\n</script>\n\n<ColumnCanvas.Root controller={canvas}>\n\t<ColumnCanvas.Column id="workspace" title="Workspace" sticky>\n\t\t{#snippet stickyRail()}\n\t\t\t<ArrowLeft data-icon="inline-start" aria-hidden="true" />\n\t\t{/snippet}\n\t\t<ColumnCanvas.Body><!-- The source panel always remains in normal flow. --></ColumnCanvas.Body>\n\t</ColumnCanvas.Column>\n\t<ColumnCanvas.Column id="inbox" title="Inbox" sticky>\n\t\t{#snippet stickyRail()}\n\t\t\t<ArrowLeft data-icon="inline-start" aria-hidden="true" />\n\t\t{/snippet}\n\t\t<ColumnCanvas.Body><!-- Consumer-owned panel content. --></ColumnCanvas.Body>\n\t</ColumnCanvas.Column>\n\t<ColumnCanvas.Column id="tasks" title="Tasks">\n\t\t<ColumnCanvas.Body><!-- Later columns continue in normal flow. --></ColumnCanvas.Body>\n\t</ColumnCanvas.Column>\n</ColumnCanvas.Root>';

export const StickyFixed =
  '<script lang="ts">\n\timport ArrowLeft from "@lucide/svelte/icons/arrow-left";\n</script>\n\n<ColumnCanvas.Root controller={canvas} displayMode="fixed">\n\t<ColumnCanvas.Column id="workspace" title="Workspace" sticky>\n\t\t{#snippet stickyRail()}<ArrowLeft data-icon="inline-start" aria-hidden="true" />{/snippet}\n\t</ColumnCanvas.Column>\n\t<ColumnCanvas.Column id="inbox" title="Inbox" sticky>\n\t\t{#snippet stickyRail()}<ArrowLeft data-icon="inline-start" aria-hidden="true" />{/snippet}\n\t</ColumnCanvas.Column>\n\t<ColumnCanvas.Column id="detail" title="Detail" />\n</ColumnCanvas.Root>';
