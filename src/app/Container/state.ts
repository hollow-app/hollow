import { Layout } from "@type/hollow";
import { ContainerProps } from ".";
import type { HelperType } from "./helper";
import { createLayout } from "@utils/layout";
import { hollow } from "hollow";
import { Accessor, onMount, Setter } from "solid-js";
import { createSignal } from "solid-js";
import { ConfigsType } from "solid-kitx";

export type StateType = {
	controller: Layout;
	isSettings: Accessor<boolean>;
	setSettings: Setter<boolean>;
	canvasConfigs: Accessor<ConfigsType>;
	setCanvasConfigs: Setter<ConfigsType>;
};

export const createContainerState = (
	props: ContainerProps,
	helper?: HelperType,
): StateType => {
	const controller = createLayout();
	const [isSettings, setSettings] = createSignal(false);
	const [canvasConfigs, setCanvasConfigs] = createSignal<ConfigsType>({
		gridSize: 50,
		disableZoom: true,
		disableEdgeDrag: true,
		disableNodeDrag: true,
		disableAnchorConnectionCreation: true,
		disableNodeAnchors: true,
	});

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
	};
};
