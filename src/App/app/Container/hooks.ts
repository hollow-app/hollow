import { createSignal, createMemo, onMount, Accessor, Setter } from "solid-js";
import { hollow } from "../../../hollow";
import { registerHotkeyEvent } from "@managers/Hotkeys";
import { selectPanel } from "@managers/layout";

export interface ContainerState {
	isSettings: Accessor<boolean>;
	setSettings: Setter<boolean>;
}

export interface ContainerActions {}

export interface ContainerHook {
	state: ContainerState;
	actions: ContainerActions;
}

export const useContainer = (): ContainerHook => {
	const [isSettings, setSettings] = createSignal(false);

	// Actions
	const showEditor = () => {
		selectPanel("right", "editor");
	};

	onMount(() => {
		hollow.pevents.on("editor", showEditor);
		registerHotkeyEvent("Toggle Notifications", () =>
			selectPanel("right", "notifications"),
		);
		registerHotkeyEvent("Toggle Expand", () =>
			selectPanel("left", "expand"),
		);
		registerHotkeyEvent("Toggle Settings", () => setSettings((p) => !p));
		registerHotkeyEvent("Toggle Editor", () =>
			selectPanel("right", "editor"),
		);
	});

	return {
		state: {
			isSettings,
			setSettings,
		},
		actions: {},
	};
};
