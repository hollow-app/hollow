import {
	createSignal,
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
import { useHollow } from "../../../HollowContext";

export interface CanvasProps {
	layout: Layout;
}

export interface CanvasState {
	gridEl: Accessor<HTMLDivElement | undefined>;
	setGridEl: (el: HTMLDivElement) => void;
	canvasEl: Accessor<HTMLDivElement | undefined>;
	setCanvasEl: (el: HTMLDivElement) => void;
	grid: Accessor<GridStack | undefined>;
	options: Accessor<any>;
	setOptions: Setter<any>;
}

export interface CanvasHook {
	state: CanvasState;
}

export const useCanvas = (props: CanvasProps): CanvasHook => {
	const { isLiveEditor, canvasConfigs } = useHollow();
	const [gridEl, setGridElSignal] = createSignal<HTMLDivElement>();
	const [canvasEl, setCanvasEl] = createSignal<HTMLDivElement>();
	const [grid, setGrid] = createSignal<GridStack>();
	const [options, setOptions] = createSignal<any>({
		overflow: { x: "scroll", y: "scroll" },
		scrollbars: {
			visibility: "auto",
			autoHide: "leave",
			autoHideDelay: 800,
			theme: "os-theme-native",
		},
	});
	const { isFocus } = useHollow();
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
			canvasConfigs,
			(configs) => {
				const g = grid();
				if (g) g.updateOptions(configs);
			},
			{ defer: true },
		),
	);

	createEffect(
		on(
			isLiveEditor,
			(v) => {
				const g = grid();
				if (!g) return;
				if (v) {
					g.on("change", onChange);
				} else {
					g.off("change");
				}
			},
			{ defer: true },
		),
	);

	createEffect(
		on(
			isFocus,
			(v) => {
				if (v) {
					setOptions({
						overflow: { x: "hidden", y: "hidden" },
					});
				} else {
					setOptions({
						overflow: { x: "scroll", y: "scroll" },
						scrollbars: {
							visibility: "auto",
							autoHide: "leave",
							autoHideDelay: 800,
							theme: "os-theme-native",
						},
					});
				}
			},
			{ defer: true },
		),
	);
	onMount(() => {
		const element = gridEl();
		if (element) {
			const g = GridStack.init(canvasConfigs(), element);
			setGrid(g);
		}
	});

	return {
		state: {
			gridEl,
			setGridEl: setGridElSignal,
			canvasEl,
			setCanvasEl,
			grid,
			options,
			setOptions,
		},
	};
};
