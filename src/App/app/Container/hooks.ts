import { onMount, Accessor, Setter } from "solid-js";
import { hollow } from "../../../hollow";
import { registerHotkeyEvent } from "@managers/Hotkeys";
import { selectPanel } from "@managers/layout";
import { useStore } from "@shared/store";

export interface ContainerState {}

export interface ContainerActions {}

export interface ContainerHook {
	state: ContainerState;
	actions: ContainerActions;
}

export const useContainer = (): ContainerHook => {
	const { dispatch } = useStore();
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
		registerHotkeyEvent("Toggle Settings", () =>
			dispatch({ domain: "context", type: "toggle-settings" }),
		);
		registerHotkeyEvent("Toggle Editor", () =>
			selectPanel("right", "editor"),
		);
	});

	return {
		state: {},
		actions: {},
	};
};
