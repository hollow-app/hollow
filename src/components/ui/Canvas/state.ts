import { GridStack } from "gridstack";
import { CanvasProps } from ".";
import type { HelperType } from "./helper";
import { Accessor, createMemo, createSignal, onMount, Setter } from "solid-js";

export type StateType = {
	gridEl: HTMLDivElement;
	setGridEl: (el: HTMLDivElement) => void;
	grid: GridStack;
	isAnySidePanelVisible: Accessor<boolean>;
};

export const createCanvasState = (
	props: CanvasProps,
	helper?: HelperType,
): StateType => {
	let gridEl!: HTMLDivElement;
	let grid: GridStack;
	const isAnySidePanelVisible = createMemo(() => {
		const store = props.layout.get;
		return store.left.visible || store.right.visible;
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
