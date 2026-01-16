import { RootState, Action } from "./types";
import { accountReducer } from "@managers/Account/reducer";
import { contextReducer } from "../context/reducer";
import { settingsReducer } from "@managers/Settings/reducer";
import { codeThemeReducer } from "@managers/CodeTheme/reducer";
import { moduleReducer } from "@managers/Module/reducer";
import { hotkeysReducer } from "@managers/Hotkeys";
import { vaultReducer } from "@managers/Vault";
import { notificationsReducer } from "@managers/Notifications";
import { realmReducer } from "@managers/Realm";

export function rootReducer(
	state: RootState | undefined,
	action: Action,
): RootState {
	return {
		account: accountReducer(state?.account, action as any),
		context: contextReducer(state?.context, action as any),
		settings: settingsReducer(state?.settings, action as any),
		codeTheme: codeThemeReducer(state?.codeTheme, action as any),
		module: moduleReducer(state?.module, action as any),
		hotkeys: hotkeysReducer(state?.hotkeys, action as any),
		vault: vaultReducer(state?.vault, action as any),
		notifications: notificationsReducer(
			state?.notifications,
			action as any,
		),
		realm: realmReducer(state.realm, action as any),
	};
}
