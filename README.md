# OfficeUI

OfficeUI is a Svelte component library for agentic management: the interface layer for coordinating AI agents, workflows, tasks, approvals, and operational signals in one experience.

Built for teams that want to run autonomous work with human oversight, OfficeUI brings together the building blocks for dashboards, queues, runbooks, and decision surfaces used in modern AI operations.

## Why OfficeUI

OfficeUI is designed for agentic software environments where work is distributed across tools, agents, and workflows. It helps teams:

- monitor active agent runs and task queues
- review approvals, exceptions, and escalations
- visualize workflow states and operational health
- provide a clean control surface for human-in-the-loop management
- standardize agent management interfaces across products and internal tools

## Core capabilities

- Agent and workflow status panels
- Operational dashboards and KPI cards
- Task, queue, and timeline views
- Approval and review interactions
- Reusable Svelte primitives for AI operations UIs
- Lightweight, component-first design for custom management experiences

## Project structure

- `src/lib` — reusable OfficeUI components and shared primitives
- `src/routes` — local showcase and preview experience for testing UI patterns
- `src/app.html` — app shell for the SvelteKit project

## Quick start

Install dependencies with Bun:

```sh
bun install
```

Start the local development environment:

```sh
bun run dev
```

Open the app in a browser to work on the component showcase and design system.

## Available scripts

```sh
bun run dev
bun run build
bun run preview
bun run check
bun run lint
bun run format
bun run storybook
```

## Building the library

To create a production build of the library package:

```sh
bun run build
```

This project is set up as a Svelte package, so `src/lib` is intended for exportable components while `src/routes` remains a visual workspace for demos and experimentation.

## Usage

Import components by name from the package root:

```svelte
<script lang="ts">
	import { AgentFleet, Button, TaskBoard } from 'officeui';
</script>
```

## Theming

Import the tokens once (e.g. in your root layout), then opt in on an ancestor such as `<html>`:

```svelte
<script lang="ts">
	import 'officeui/tokens.css';
	import 'officeui/theme-officeui.css'; // optional theme
</script>
```

```html
<html data-ds data-ds-theme="officeui" data-theme="dark"> <!-- data-theme="dark" is optional -->
```

Override tier 1 (`--p-*`) or tier 2 (`--ds-*`) variables to customise; see the header of `tokens.css`.

## Roadmap

OfficeUI is intended to evolve into a reusable design system for agentic management, covering:

- orchestration dashboards
- workflow planners
- runtime telemetry panels
- approval and intervention controls
- teammate and agent collaboration surfaces

## Contributing

Contributions are welcome. Keep the library focused on clear operational UX, composability, and agent-centric workflows.
