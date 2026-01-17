import { Events, RealmState } from "./type";
import { Storage } from "@managers/Storage";
import { appConfigDir, join } from "@tauri-apps/api/path";
import { hollow } from "hollow";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

let store: Storage | null = null;
let dispatch: ((action: any) => void) | null = null;

export async function setupRealm(d: (action: any) => void) {
	dispatch = d;
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

	const data = store.getData();
	dispatch({
		domain: "realm",
		type: "set-state",
		state: data,
	});
}

export async function realmEffects(action: Events, state: RealmState) {
	if (action.domain !== "realm") return;

	// Sync to storage
	if (
		[
			"set-select-on-startup",
			"enter-realm",
			"add-realm",
			"remove-realm",
			"update-colors",
		].includes(action.type)
	) {
		// We can just dump the whole state to store, matching the structure
		store?.setMany({
			current: state.current,
			realms: state.realms,
			selectOnStartup: state.selectOnStartup,
		});
	}

	switch (action.type) {
		case "enter-realm":
			await invoke("open_main_window");
			const window = getCurrentWindow();
			await window.close();
			break;
		case "remove-realm":
			localStorage.removeItem(`${action.realmId}-color-primary`);
			localStorage.removeItem(`${action.realmId}-color-secondary`);
			break;
		case "toggle-realm":
			hollow.events.emit("confirm", {
				title: "Warning",
				message:
					"Switching realms requires a restart of the application.\\nWould you like to proceed?",

				onAccept: async () => {
					// Clear current realm in store directly or dispatch?
					// If we dispatch, we trigger effects again.
					// But we want to ensure it's saved before we switch.

					// We can dispatch a set-state to clear current, which will sync to store.
					dispatch!({
						domain: "realm",
						type: "set-state",
						state: { current: null },
					});

					// Open selector window
					await invoke("open_realm_selector");

					// Close current window
					await getCurrentWindow().close();
				},
			});
			break;
	}
}
