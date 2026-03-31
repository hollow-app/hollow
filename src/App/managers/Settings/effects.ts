import { Events, SettingsConfig } from "./types";
import { Storage } from "../Storage";
import { hollow } from "../../../hollow";
import { join } from "@tauri-apps/api/path";
import DEFAULT from "@assets/configs/settings.json?raw";
import { getCurrentRealm } from "@shared/managers/Realm";
import useGrid from "@app/hooks/useGrid";

let storage: Storage | null = null;

export function setupSettings(dispatch: (action: any) => void) {
	hollow.pevents.on("post-realm", async () => {
		const path = await join(
			...[getCurrentRealm().location, ".hollow", "settings.json"],
		);
		storage = await Storage.create({
			path,
			options: {
				defaults: JSON.parse(DEFAULT),
			},
		});
		dispatch({
			domain: "settings",
			type: "set-configs",
			configs: storage.getData(),
		});
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
	}
}

export function getSettingsConfig(key: string) {
	return storage.get(key);
}
