import {
	createSignal,
	createEffect,
	on,
	onMount,
	Accessor,
	Setter,
	createMemo,
} from "solid-js";
import { GridStack, GridStackNode, GridStackOptions } from "gridstack";
import { CardType } from "@app/type/hollow";
import { useStore } from "@shared/store";
import {
	selectCanvasConfigs,
	selectIsLiveEditor,
	selectIsFocus,
} from "../../../context/selectors";

export interface CanvasProps {}

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
	const { state, dispatch } = useStore();
	const isLiveEditor = createMemo(() => state.context.isLiveEditor);
	const canvasConfigs = createMemo<GridStackOptions>(() => {
		console.log("updated config");
		const gridSize = state.settings["grid-size"];
		const gridGap = state.settings["grid-gap"];
		return {
			...state.context.canvasConfigs,
			column: gridSize,
			cellHeight: (window.innerHeight - 16 + gridGap) / gridSize,
		};
	});
	const [gridEl, setGridElSignal] = createSignal<HTMLDivElement>();
	const [canvasEl, setCanvasEl] = createSignal<HTMLDivElement>();
	const [grid, setGrid] = createSignal<GridStack>();
	const [options, setOptions] = createSignal<any>({
		overflow: { x: "scroll", y: "scroll" },
		scrollbars: {
			visibility: "auto",
			autoHide: "never",
			autoHideDelay: 800,
			theme: "os-theme-native",
		},
	});
	const isFocus = () => selectIsFocus(state);
	const onChange = (_: any, changed: GridStackNode[]) => {
		if (!changed.length) return;

		const allCards = state.module.instances;
		const toolsMap: Record<string, CardType[]> = {};

		changed.forEach((node) => {
			const card = allCards.find((c) => c.id === node.id);
			if (card) {
				const updatedCard = {
					...card,
					x: node.x!,
					y: node.y!,
					w: node.w!,
					h: node.h!,
				};
				const tool = card.data.tool;
				if (!toolsMap[tool]) toolsMap[tool] = [];
				toolsMap[tool].push(updatedCard);
			}
		});

		const targets = Object.entries(toolsMap).map(([toolName, cards]) => ({
			toolName,
			cards,
		}));

		if (targets.length > 0) {
			dispatch({
				domain: "module",
				type: "update-instances",
				cardsToUpdate: targets,
			});
		}
	};

	createEffect(
		on(
			canvasConfigs,
			(configs) => {
				console.log("canvas-option-updated");
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
				// g.updateOptions(canvasConfigs());
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
