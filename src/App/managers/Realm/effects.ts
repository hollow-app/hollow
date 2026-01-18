import { Events, RealmState } from "./type";
import { Storage } from "@managers/Storage";
import { appConfigDir, join } from "@tauri-apps/api/path";
import { hollow } from "../../../hollow";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Realm } from "@type/Realm";
import { useColor } from "@hooks/useColor";

type RealmsConfig = {
	current: string | null;
	realms: Realm[];
	selectOnStartup: boolean;
};
let store: Storage | null = null;
let dispatch: ((action: any) => void) | null = null;
let currentRealm: Realm = null;

async function start() {
	const path = await join(...[await appConfigDir(), "realms.json"]);
	store = await Storage.create({
		path,
		options: {
			defaults: {
				current: null,
				realms: [],
				selectOnStartup: false,
			},
		},
	});
	const data = store.getData() as RealmsConfig;
	currentRealm = data.realms.find((r) => r.id === data.current);
}

hollow.pevents.on("pre-realm", start);
export async function setupRealm(d: (action: any) => void) {
	dispatch = d;
	if (currentRealm) {
		dispatch({
			domain: "realm",
			type: "set-realm",
			realm: currentRealm,
		});
	} else {
		// If no current realm is found but we are in the main app, something is wrong.
		// Maybe we should trigger the selector?
		// Or just do nothing and let the UI handle "no realm" state?
		// For now, do nothing.
	}
}

export async function realmEffects(action: Events, state: RealmState) {
	if (action.domain !== "realm") return;

	switch (action.type) {
		case "update-colors": {
			if (!state) return;
			const data = store?.getData() as RealmsConfig;
			const updatedRealms = data.realms.map((r) =>
				r.id === state.id ? { ...r, colors: state.colors } : r,
			);
			// TEST
			useColor({
				name: Object.keys(state.colors)[0],
				color: Object.values(state.colors)[0],
			});
			store?.set("realms", updatedRealms);
			break;
		}
	}
}

export function getCurrentRealm() {
	return currentRealm;
}
export function toggleRealm() {
	hollow.events.emit("confirm", {
		title: "Warning",
		message:
			"Switching realms requires a restart of the application.\\nWould you like to proceed?",

		onAccept: async () => {
			// Clear current realm in store
			store?.set("current", null);

			// Open selector window
			await invoke("open_realm_selector");

			// Close current window
			await getCurrentWindow().close();
		},
	});
}
export function selectRealmOnStartup(): boolean {
	return store.get("select_on_startup") ?? false;
}
export function setSelectRealmOnStartup(value: boolean) {
	store.set("select_on_startup", value);
}
