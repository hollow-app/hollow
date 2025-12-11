import { CardType, Layout } from "@type/hollow";
import { ContainerProps } from ".";
import type { HelperType } from "./helper";
import { createLayout } from "@utils/layout";
import { hollow } from "hollow";
import { Accessor, createMemo, onMount, Setter } from "solid-js";
import { createSignal } from "solid-js";
import { ConfigsType } from "solid-kitx";
import { hotkeysManager } from "@managers/HotkeysManager";

type AltConfigsType = Omit<ConfigsType, "gridSize">;
export type StateType = {
	controller: Layout;
	isSettings: Accessor<boolean>;
	setSettings: Setter<boolean>;
	canvasConfigs: Accessor<AltConfigsType>;
	setCanvasConfigs: Setter<AltConfigsType>;
	isLiveEditor: Accessor<boolean>;
};
export const createContainerState = (
	props: ContainerProps,
	helper?: HelperType,
): StateType => {
	const controller = createLayout();
	const [isSettings, setSettings] = createSignal(false);
	const [canvasConfigs, setCanvasConfigs] = createSignal<AltConfigsType>({
		disableZoom: true,
		disableEdgeDrag: true,
		disableNodeDrag: true,
		disableAnchorConnectionCreation: true,
		disableNodeAnchors: true,
		disableHorizontalPan: true,
		disableVerticalPan: true,
		filterNodes: (n: CardType) => n.data.extra.isPlaced,
	});
	const isLiveEditor = createMemo(() => !canvasConfigs().disableNodeDrag);

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
