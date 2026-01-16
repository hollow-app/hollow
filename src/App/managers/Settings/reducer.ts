import { SettingsConfig, Events } from "./types";
import DEFAULT from "@assets/configs/settings.json?raw";

const initialState: SettingsConfig = JSON.parse(DEFAULT);

export function settingsReducer(
	state: SettingsConfig = initialState,
	action: Events,
): SettingsConfig {
	if (action.domain !== "settings") return state;

	switch (action.type) {
		case "set-configs":
			return { ...state, ...action.configs };
		default:
			return state;
	}
}
