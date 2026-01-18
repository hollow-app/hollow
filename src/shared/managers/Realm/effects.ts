import { Events, RealmState } from "./types";
import { appConfigDir, join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Realm } from "@type/Realm";
import { Storage } from "@managers/Storage";
import { useColor } from "@hooks/useColor";
import { hollow } from "../../../hollow";
import { _dispatch } from "@shared/store/effects";

type RealmsConfig = {
	current: string | null;
	realms: Realm[];
	selectOnStartup: boolean;
};

let store: Storage | null = null;

export async function setupRealm(d: (action: any) => void) {
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
	_dispatch({
		domain: "realm",
		type: "load-realms",
		state: data,
	});
}

export async function realmEffects(action: Events, state: RealmState) {
	if (action.domain !== "realm") return;

	// Sync to storage for relevant actions
	if (
		[
			"set-select-on-startup",
			"enter-realm",
			"add-realm",
			"remove-realm",
			"update-colors",
		].includes(action.type)
	) {
		store?.setMany({
			current: state.current?.id || null,
			realms: state.realms,
			selectOnStartup: state.selectOnStartup,
		});
	}

	switch (action.type) {
		case "update-colors": {
			if (!state.current) return;
			// Apply color changes to UI
			const colors = action.colors;
			useColor({
				name: Object.keys(colors)[0],
				color: Object.values(colors)[0] as string,
			});
			break;
		}
		case "enter-realm":
			store.set("current", action.realmId);
			// Open main window and close selector
			break;
		case "remove-realm":
			// Clean up localStorage for removed realm
			localStorage.removeItem(`${action.realmId}-color-primary`);
			localStorage.removeItem(`${action.realmId}-color-secondary`);
			break;
	}
}

// Helper functions for convenience
export function getCurrentRealm(): Realm | null {
	if (!store) return;
	const list: Realm[] = store.get("realms");
	return list.find((i) => i.id === store.get("current"));
}

export function getRealmList(state: RealmState): Realm[] {
	return state.realms;
}

export function toggleRealm() {
	hollow.events.emit("confirm", {
		title: "Warning",
		message:
			"Switching realms requires a restart of the application.\\nWould you like to proceed?",
		onAccept: async () => {
			// Clear current realm
			store?.set("current", null);
			// Open selector window
			//	await invoke("open_realm_selector");
			// Close current window
			//	await getCurrentWindow().close();
		},
	});
}

export function selectRealmOnStartup(): boolean {
	return store?.get("select_on_startup") ?? false;
}

export function setSelectRealmOnStartup(value: boolean) {
	store?.set("select_on_startup", value);
}
