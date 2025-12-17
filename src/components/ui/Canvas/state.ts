import { GridStack } from "gridstack";
import { CanvasProps } from ".";
import type { HelperType } from "./helper";
import { Accessor, createMemo, createSignal, onMount, Setter } from "solid-js";

export type StateType = {
	gridEl: HTMLDivElement;
	setGridEl: (el: HTMLDivElement) => void;
	grid: GridStack;
	isAnySidePanelVisible: Accessor<{ state: boolean; count: number }>;
};

export const createCanvasState = (
	props: CanvasProps,
	helper?: HelperType,
): StateType => {
	let gridEl!: HTMLDivElement;
	let grid: GridStack;
	const isAnySidePanelVisible = createMemo(() => {
		const store = props.layout.get;
		const count = Number(store.left.visible) + Number(store.right.visible);
		return { state: count > 0, count };
	});
	return {
		grid,
		gridEl,
		isAnySidePanelVisible,
		setGridEl: (el) => {
			gridEl = el;
		},
	};
};
