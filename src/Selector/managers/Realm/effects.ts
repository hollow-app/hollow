import { Events, RealmState } from "./types";
import { Realm } from "@app/type/Realm";
import { useColor } from "@app/hooks/useColor";
import { _dispatch } from "@selector/store/effects";
import { get_realms_config, select_realm, update_realms_config } from "@rust";

type RealmsConfig = {
	current: string | null;
	realms: Realm[];
	selectOnStartup: boolean;
};

export async function setupRealm(d: (action: any) => void) {
	const data: RealmsConfig = await get_realms_config();
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
		await update_realms_config({
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
			await select_realm(action.realmId);
			// Open main window and close selector
			break;
		case "remove-realm":
			// Clean up localStorage for removed realm
			localStorage.removeItem(`${action.realmId}-color-primary`);
			localStorage.removeItem(`${action.realmId}-color-secondary`);
			break;
	}
}

export function getRealmList(state: RealmState): Realm[] {
	return state.realms;
}

// export function toggleRealm() {
// 	hollow.events.emit("confirm", {
// 		title: "Warning",
// 		message:
// 			"Switching realms requires a restart of the application.\\nWould you like to proceed?",
// 		onAccept: async () => {
// 			// Clear current realm
// 			store?.set("current", null);
// 			// Open selector window
// 			//	await invoke("open_realm_selector");
// 			// Close current window
// 			//	await getCurrentWindow().close();
// 		},
// 	});
// }

// export function selectRealmOnStartup(): boolean {
// 	return store?.get("select_on_startup") ?? false;
// }

// export function setSelectRealmOnStartup(value: boolean) {
// 	store?.set("select_on_startup", value);
// }
