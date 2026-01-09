import { createSignal, createMemo, onMount, Accessor, Setter } from "solid-js";
import { createLayout, Layout } from "@utils/layout";
import { hollow } from "hollow";
import { manager } from "@managers/index";
import { GridStackOptions } from "gridstack";

export interface ContainerState {
	controller: Layout;
	isSettings: Accessor<boolean>;
	setSettings: Setter<boolean>;
}

export interface ContainerActions {}

export interface ContainerHook {
	state: ContainerState;
	actions: ContainerActions;
}

export const useContainer = (): ContainerHook => {
	const controller = createLayout();
	const [isSettings, setSettings] = createSignal(false);

	// Actions
	const showEditor = () => {
		controller.selectPanel("right", "editor");
	};

	onMount(() => {
		hollow.pevents.on("editor", showEditor);
		manager.hotkeys.events["Toggle Notifications"] = () =>
			controller.selectPanel("right", "notifications");
		manager.hotkeys.events["Toggle Expand"] = () =>
			controller.selectPanel("left", "expand");
		manager.hotkeys.events["Toggle Settings"] = () =>
			setSettings((p) => !p);
		manager.hotkeys.events["Toggle Editor"] = () => {
			controller.selectPanel("right", "editor");
		};
	});

	return {
		state: {
			controller,
			isSettings,
			setSettings,
		},
		actions: {},
	};
};
