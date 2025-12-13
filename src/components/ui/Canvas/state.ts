import { GridStack } from "gridstack";
import { CanvasProps } from ".";
import type { HelperType } from "./helper";
import { onMount } from "solid-js";

export type StateType = {
	gridEl: HTMLDivElement;
	grid: GridStack;
};

export const createCanvasState = (
	props: CanvasProps,
	helper?: HelperType,
): StateType => {
	let gridEl!: HTMLDivElement;
	let grid: GridStack;
	return { grid, gridEl };
};
