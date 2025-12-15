import { GridStack } from "gridstack";
import { CanvasProps } from ".";
import type { HelperType } from "./helper";
import { Accessor, createMemo, onMount } from "solid-js";
import { hollow } from "hollow";
import { Layout } from "@type/hollow";

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
