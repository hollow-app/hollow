import { AccountState } from "@app/managers/Account/types";
import { GridStackOptions } from "gridstack";
import { SettingsConfig } from "@app/managers/Settings/types";
import { CodeThemeState } from "@app/managers/CodeTheme/types";
import { Events as AccountEvents } from "@app/managers/Account/types";
import { Events as SettingsEvents } from "@app/managers/Settings/types";
import { Events as CodeThemeEvents } from "@app/managers/CodeTheme/types";
import { Events as ModuleEvents } from "@app/managers/Module/type";
import { Events as HotkeysEvents } from "@app/managers/Hotkeys/type";
import { Events as VaultEvents } from "@app/managers/Vault/type";
import { Events as NotificationsEvents } from "@app/managers/Notifications/type";
import { Events as ExtensionEvents } from "@app/managers/Extension/type";
import { LayoutEvents, LayoutState } from "@app/managers/layout";
import { ModuleState } from "@app/managers/Module/type";
import { HotkeysState } from "@app/managers/Hotkeys";
import { VaultState } from "@app/managers/Vault";
import { ContextEvents, ContextState } from "@app/context/type";
import { NotificationsState } from "@app/managers/Notifications";
import { Events as RealmEvents, RealmState } from "../managers/Realm";
import { ExtensionState } from "@app/managers/Extension/type";

// Root State
export interface RootState {
	extension: ExtensionState;
	account: AccountState;
	context: ContextState;
	settings: SettingsConfig;
	codeTheme: CodeThemeState;
	module: ModuleState;
	hotkeys: HotkeysState;
	vault: VaultState;
	notifications: NotificationsState;
	realm: RealmState;
	layout: LayoutState;
	_drafts?: Record<
		string,
		{ path: string; data: any; select?: { key: string; value: any } }
	>;
}

export type Action =
	| ExtensionEvents
	| AccountEvents
	| SettingsEvents
	| CodeThemeEvents
	| ContextEvents
	| ModuleEvents
	| HotkeysEvents
	| VaultEvents
	| NotificationsEvents
	| RealmEvents
	| LayoutEvents
	| {
		type: "DRAFT_START";
		path: string;
		select?: { key: string; value: any };
	}
	| { type: "DRAFT_COMMIT" }
	| { type: "DRAFT_CANCEL" };

export type DispatchOptions = {
	runEffects?: boolean;
	draft?: string;
};

// external
type Path<T> = T extends object
	? {
		[K in keyof T & string]: K | `${K}.${Path<T[K]>}`;
	}[keyof T & string]
	: never;

export function usePath<T>() {
	return <P extends Path<T>>(p: P) => p;
}
// internal
export const storePath = usePath<RootState>();
