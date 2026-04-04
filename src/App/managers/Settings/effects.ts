import { Events, SettingsConfig } from "./types";
import { Storage } from "../Storage";
import { hollow } from "../../../hollow";
import { join } from "@tauri-apps/api/path";
import DEFAULT from "@assets/configs/settings.json?raw";
import useGrid from "@app/hooks/useGrid";
import { Realm } from "@app/type/Realm";

let storage: Storage | null = null;

export async function setupSettings(dispatch: (action: any) => void) {
	const currentRealm = getCurrentRealm();
	const path = await join(
		...[currentRealm.location, ".hollow", "settings.json"],
	);
	storage = await Storage.create({
		path,
		options: {
			defaults: {
				...JSON.parse(DEFAULT),
				realm: currentRealm,
			} as SettingsConfig,
		},
	});
	const configs = storage.getData() as SettingsConfig;
	if (!configs.realm) {
		configs.realm = currentRealm;
	}
	dispatch({
		domain: "settings",
		type: "set-configs",
		configs,
	});
}

export function settingsEffects(action: Events, state: SettingsConfig) {
	if (action.domain !== "settings") return;

	switch (action.type) {
		case "set-configs":
			const gap = action.configs["grid-gap"];
			if (gap) {
				useGrid([{ name: "--grid-gap", value: gap }]);
			}
			if (storage) {
				storage.setMany(action.configs);
			}
			break;
		case "update-colors":
			// TODO realm, update the rust config
			if (storage) {
				storage.set("realm", state.realm);
			}
	}
}

export function getSettingsConfig(key: string) {
	return storage.get(key);
}
export function getCurrentRealm() {
	return hollow.realm as Realm;
}
