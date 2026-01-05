import {
	createSignal,
	createMemo,
	createEffect,
	on,
	onMount,
	Accessor,
	Setter,
} from "solid-js";
import { GridStack, GridStackOptions, GridStackNode } from "gridstack";
import { Layout } from "@utils/layout";
import { hollow } from "hollow";
import { CardType } from "@type/hollow";

export interface CanvasProps {
	canvasConfigs: Accessor<GridStackOptions>;
	setCanvasConfigs: Accessor<GridStackOptions>;
	isLiveEditor: Accessor<boolean>;
	layout: Layout;
	anyExpanded: Accessor<boolean>;
	setAnyExpanded: Setter<boolean>;
}

export interface CanvasState {
	gridEl: Accessor<HTMLDivElement | undefined>;
	setGridEl: (el: HTMLDivElement) => void;
	grid: Accessor<GridStack | undefined>;
}

export interface CanvasHook {
	state: CanvasState;
}

export const useCanvas = (props: CanvasProps): CanvasHook => {
	const [gridEl, setGridElSignal] = createSignal<HTMLDivElement>();
	const [grid, setGrid] = createSignal<GridStack>();

	const onChange = (_: any, changed: GridStackNode[]) => {
		if (!changed.length) return;
		const fin: Record<string, CardType[]> = {};
		const changedMap = new Map<string, GridStackNode>();
		for (const n of changed) {
			if (n.id) changedMap.set(n.id, n);
		}
		hollow.setCards(
			(c) => changedMap.has(c.id),
			(c) => {
				const node = changedMap.get(c.id);
				if (!node) return c;

				const updated: CardType = {
					...c,
					x: node.x!,
					y: node.y!,
					w: node.w!,
					h: node.h!,
				};

				const tool = c.data.tool;
				if (!fin[tool]) fin[tool] = [];
				fin[tool].push(updated);

				return updated;
			},
		);
		const targets = Object.entries(fin).map(([toolName, cards]) => ({
			toolName,
			cards,
		}));

		hollow.toolManager.updateCards(targets);
	};

	createEffect(
		on(
			props.canvasConfigs,
			(configs) => {
				const g = grid();
				if (g) g.updateOptions(configs);
			},
			{ defer: true },
		),
	);

	createEffect(
		on(
			props.isLiveEditor,
			() => {
				const g = grid();
				if (!g) return;
				if (props.isLiveEditor()) {
					g.on("change", onChange);
				} else {
					g.off("change");
				}
			},
			{ defer: true },
		),
	);

	onMount(() => {
		const element = gridEl();
		if (element) {
			const g = GridStack.init(props.canvasConfigs(), element);
			setGrid(g);
		}
	});

	return {
		state: {
			gridEl,
			setGridEl: setGridElSignal,
			grid,
		},
	};
};
