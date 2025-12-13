import { CanvasProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { GridStack, GridStackNode } from "gridstack";
import { CardType } from "@type/hollow";
import { hollow } from "hollow";
import { createEffect, on, onMount } from "solid-js";

export type LogicType = {};

export const CanvasLogic = (
	state: StateType,
	props: CanvasProps,
	helper?: HelperType,
): LogicType => {
	const onChange = (_, changed: GridStackNode[]) => {
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
					x: node.x,
					y: node.y,
					w: node.w,
					h: node.h,
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
			(configs) => state.grid.updateOptions(configs),
			{
				defer: true,
			},
		),
	);
	createEffect(
		on(
			props.isLiveEditor,
			() => {
				if (props.isLiveEditor()) {
					state.grid.on("change", onChange);
				} else {
					state.grid.off("change");
				}
			},
			{ defer: true },
		),
	);
	onMount(() => {
		state.grid = GridStack.init(props.canvasConfigs(), state.gridEl);
	});
	return {};
};
