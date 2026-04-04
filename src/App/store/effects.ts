import { Action, RootState } from "./types";
import { accountEffects, setupAccount } from "@app/managers/Account/effects";
import { settingsEffects, setupSettings } from "@app/managers/Settings/effects";
import {
	codeThemeEffects,
	setupCodeTheme,
} from "@app/managers/CodeTheme/effects";
import { moduleEffects, setupModule } from "@app/managers/Module/effects";
import { hotkeysEffects, setupHotkeys } from "@app/managers/Hotkeys";
import { setupVault, vaultEffects } from "@app/managers/Vault";
import {
	notificationsEffects,
	setupNotifications,
} from "@app/managers/Notifications";
import { setupLayout, layoutEffects } from "@app/managers/layout";
import {
	extensionEffects,
	setupExtension,
} from "@app/managers/Extension/effects";
import { DispatchType } from ".";

export let _dispatch: (action: Action) => void;
export let _state: () => RootState;
export function runEffects(action: Action, state: RootState) {
	const results = [
		extensionEffects(action as any, state.account),
		accountEffects(action as any, state.account),
		settingsEffects(action as any, state.settings),
		codeThemeEffects(action as any, state.codeTheme),
		moduleEffects(action as any, state.module),
		hotkeysEffects(action as any, state.hotkeys),
		vaultEffects(action as any, state.vault),
		notificationsEffects(action as any, state.notifications),
		layoutEffects(action as any, state.layout),
	];

	const promises = results.filter(
		(e): e is Promise<void> => e instanceof Promise,
	);

	return promises.length > 0
		? Promise.all(promises).then(() => {})
		: Promise.resolve();
}

export async function setupEffects(
	dispatch: DispatchType,
	getState: () => RootState,
) {
	_dispatch = dispatch;
	_state = getState;
	// plugins wait for extension to setup
	setupModule(dispatch);
	setupLayout(dispatch, getState);
	await setupExtension(dispatch);
	//
	setupAccount(dispatch, getState);
	await setupSettings(dispatch);
	setupCodeTheme(dispatch);
	setupHotkeys(dispatch);
	setupVault(dispatch);
	setupNotifications(dispatch);
	//
}
