import { CardType, Layout } from "@type/hollow";
import { ContainerProps } from ".";
import type { HelperType } from "./helper";
import { createLayout } from "@utils/layout";
import { hollow } from "hollow";
import { Accessor, createMemo, onMount, Setter } from "solid-js";
import { createSignal } from "solid-js";
import { hotkeysManager } from "@managers/HotkeysManager";
import { GridStackOptions } from "gridstack";

export type StateType = {
	controller: Layout;
	isSettings: Accessor<boolean>;
	setSettings: Setter<boolean>;
	canvasConfigs: Accessor<GridStackOptions>;
	setCanvasConfigs: Setter<GridStackOptions>;
	isLiveEditor: Accessor<boolean>;
};
export const createContainerState = (
	props: ContainerProps,
	helper?: HelperType,
): StateType => {
	const controller = createLayout();
	const [isSettings, setSettings] = createSignal(false);
	const [canvasConfigs, setCanvasConfigs] = createSignal<GridStackOptions>({
		disableResize: true,
		disableDrag: true,
		float: true,
		margin: 10,
	});
	const isLiveEditor = createMemo(() => !canvasConfigs().disableDrag);

	const ShowEditor = () => {
		controller.selectPanel("right", "editor");
	};
	onMount(() => {
		hollow.pevents.on("editor", ShowEditor);
		hotkeysManager.getSelf().events["Toggle Settings"] = () =>
			setSettings((p) => !p);
		hotkeysManager.getSelf().events["Toggle Editor"] = () => {
			controller.selectPanel("right", "editor");
		};
	});
	return {
		controller,
		isSettings,
		setSettings,
		canvasConfigs,
		setCanvasConfigs,
		isLiveEditor,
	};
};
