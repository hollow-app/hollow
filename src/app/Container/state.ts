import { ContainerProps } from ".";
import type { HelperType } from "./helper";
import { createLayout, Layout } from "@utils/layout";
import { hollow } from "hollow";
import { Accessor, createMemo, onMount, Setter } from "solid-js";
import { createSignal } from "solid-js";
import { manager } from "@managers/index";
import { GridStackOptions } from "gridstack";

export type StateType = {
	controller: Layout;
	isSettings: Accessor<boolean>;
	setSettings: Setter<boolean>;
	canvasConfigs: Accessor<GridStackOptions>;
	setCanvasConfigs: Setter<GridStackOptions>;
	isLiveEditor: Accessor<boolean>;
	anyExpanded: Accessor<boolean>;
	setAnyExpanded: Setter<boolean>;
};
export const createContainerState = (
	props: ContainerProps,
	helper?: HelperType,
): StateType => {
	const controller = createLayout();
	const settingsManager = manager.settings;
	const [anyExpanded, setAnyExpanded] = createSignal(false);
	const [isSettings, setSettings] = createSignal(false);
	const [canvasConfigs, setCanvasConfigs] = createSignal<GridStackOptions>({
		disableResize: true,
		disableDrag: true,
		float: true,
		column: settingsManager.getConfig("grid-size"),
		cellHeight:
			(window.innerHeight - 16 + settingsManager.getConfig("grid-gap")) /
			settingsManager.getConfig("grid-size"),
	});
	const isLiveEditor = createMemo(() => !canvasConfigs().disableDrag);

	const ShowEditor = () => {
		controller.selectPanel("right", "editor");
	};
	onMount(() => {
		hollow.pevents.on("editor", ShowEditor);
		manager.hotkeys.events["Toggle Notifications"] = () =>
			controller.selectPanel("right", "notifications");
		manager.hotkeys.events["Toggle Expand"] = () =>
			controller.selectPanel("left", "expand");
		manager.hotkeys.events["Toggle Settings"] = () =>
			setSettings((p) => !p);
		manager.hotkeys.events["Toggle Editor"] = () => {
			controller.selectPanel("right", "editor");
		};
		console.log("canvas configs:", canvasConfigs());
	});
	return {
		controller,
		isSettings,
		setSettings,
		canvasConfigs,
		setCanvasConfigs,
		isLiveEditor,
		anyExpanded,
		setAnyExpanded,
	};
};
