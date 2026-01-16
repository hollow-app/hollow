import { createSignal, createMemo, onMount, Accessor, Setter } from "solid-js";
import { createLayout, Layout } from "@utils/layout";
import { hollow } from "hollow";
import { registerHotkeyEvent } from "@managers/Hotkeys";

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
		registerHotkeyEvent("Toggle Notifications", () =>
			controller.selectPanel("right", "notifications"),
		);
		registerHotkeyEvent("Toggle Expand", () =>
			controller.selectPanel("left", "expand"),
		);
		registerHotkeyEvent("Toggle Settings", () => setSettings((p) => !p));
		registerHotkeyEvent("Toggle Editor", () =>
			controller.selectPanel("right", "editor"),
		);
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
