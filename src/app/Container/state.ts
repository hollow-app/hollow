import { Layout } from "@type/hollow";
import { ContainerProps } from ".";
import type { HelperType } from "./helper";
import { createLayout } from "@utils/layout";
import { hollow } from "hollow";
import { Accessor, createMemo, onMount, Setter } from "solid-js";
import { createSignal } from "solid-js";
import { ConfigsType } from "solid-kitx";

export type StateType = {
	controller: Layout;
	isSettings: Accessor<boolean>;
	setSettings: Setter<boolean>;
	canvasConfigs: Accessor<ConfigsType>;
	setCanvasConfigs: Setter<ConfigsType>;
	isLiveEditor: Accessor<boolean>;
};

export const createContainerState = (
	props: ContainerProps,
	helper?: HelperType,
): StateType => {
	const controller = createLayout();
	const [isSettings, setSettings] = createSignal(false);
	const [canvasConfigs, setCanvasConfigs] = createSignal<ConfigsType>({
		gridSize: 100,
		disableZoom: true,
		disableEdgeDrag: true,
		disableNodeDrag: true,
		disableAnchorConnectionCreation: true,
		disableNodeAnchors: true,
		disableHorizontalPan: true,
		disableVerticalPan: true,
	});
	const isLiveEditor = createMemo(() => !canvasConfigs().disableEdgeDrag);

	onMount(() => {
		hollow.pevents.on("editor", () => {
			controller.selectPanel("right", "editor");
		});
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
