import { CardProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { ContextMenuItem } from "@type/hollow";
import { hollow } from "hollow";
import { on, onCleanup, onMount } from "solid-js";
import { ExpandIcon, PencilRulerIcon, SettingsIcon } from "lucide-solid";
import MyIcon, { MyIconFun } from "@components/MyIcon";
import { createEffect } from "solid-js";

export type LogicType = {
	onContextMenu: () => void;
};

export const CardLogic = (
	state: StateType,
	props: CardProps,
	helper?: HelperType,
): LogicType => {
	const tool = props.node.data.tool;
	const onContextMenu = () => {
		const cmItems: ContextMenuItem = {
			id: `vault`,
			header: "Card",
			items: [
				{
					icon: ExpandIcon,
					label: "Focus Mode",
					onclick: () => expand(),
				},
				{
					icon: MyIconFun({ name: "designtools-outline" }),
					label: "Modify",
					onclick: showEditor,
				},
				{
					icon: MyIconFun({ name: "gear-outline" }),
					label: "Configure",
					onclick: showSettings,
				},
			],
		};
		hollow.events.emit("context-menu-extend", cmItems);
	};

	const showEditor = () => {
		hollow.pevents.emit("editor", {
			tool: tool,
			cardId: props.node.id,
		});
		hollow.events.emit("context-menu", false);
	};
	const showSettings = () => {
		hollow.toolManager
			.getToolEvents(tool)
			.emit(`${props.node.id}-settings`, true);
		hollow.events.emit("context-menu", false);
	};
	const expand = () => {
		hollow.toolManager
			.getToolEvents(tool)
			.toggle(`${props.node.id}-expand`);
	};
	createEffect(() => {
		if (!props.grid && !state.el) return;
		if (props.node.data.isPlaced) {
			props.grid.makeWidget(state.el());
		}
	});
	const toggleExpand = (v: boolean) => {
		state.setExpand(v);
		props.setAnyExpaneded(v);
	};
	onMount(async () => {
		state.setLoaded(await hollow.toolManager.loadCard(props.node, tool));
		hollow.toolManager
			.getToolEvents(tool)
			.on(`${props.node.id}-expand`, toggleExpand);
	});
	onCleanup(() => {
		props.grid?.removeWidget(state.el(), false);
		hollow.toolManager
			.getToolEvents(tool)
			.off(`${props.node.id}-expand`, toggleExpand);
	});
	return { onContextMenu };
};
