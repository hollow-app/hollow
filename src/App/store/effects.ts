import { Action, RootState } from "./types";
import { accountEffects, setupAccount } from "@managers/Account/effects";
import { settingsEffects, setupSettings } from "@managers/Settings/effects";
import { codeThemeEffects, setupCodeTheme } from "@managers/CodeTheme/effects";
import { moduleEffects, setupModule } from "@managers/Module/effects";
import { hotkeysEffects, setupHotkeys } from "@managers/Hotkeys";
import { setupVault, vaultEffects } from "@managers/Vault";
import {
	notificationsEffects,
	setupNotifications,
} from "@managers/Notifications";
import { realmEffects, setupRealm } from "@managers/Realm";

export function runEffects(action: Action, state: RootState) {
	const results = [
		accountEffects(action as any, state.account),
		settingsEffects(action as any, state.settings),
		codeThemeEffects(action as any, state.codeTheme),
		moduleEffects(action as any, state.module),
		hotkeysEffects(action as any, state.hotkeys),
		vaultEffects(action as any, state.vault),
		notificationsEffects(action as any, state.notifications),
		realmEffects(action as any, state.realm),
	];

	// const promises = results.filter((r) => r instanceof Promise);
	// if (promises.length > 0) {
	// 	return Promise.all(results).then((res) =>
	// 		res.find((r) => r !== undefined),
	// 	);
	// }
	// return results.find((r) => r !== undefined);
	const promises = results.filter(
		(e): e is Promise<void> => e instanceof Promise,
	);

	return promises.length > 0
		? Promise.all(promises).then(() => {})
		: Promise.resolve();
}

export function setupEffects(dispatch: (action: Action) => void) {
	setupAccount(dispatch);
	setupSettings(dispatch);
	setupCodeTheme(dispatch);
	setupModule(dispatch);
	setupHotkeys(dispatch);
	setupVault(dispatch);
	setupNotifications(dispatch);
	setupRealm(dispatch);
}
