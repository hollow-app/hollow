import { CharacterState } from "@managers/Account/types";
import { CardType, TagType } from "../type/hollow"; // Check this path
import { GridStackOptions } from "gridstack";
import { SettingsConfig } from "@managers/Settings/types";
import { CodeThemeState } from "@managers/CodeTheme/types";
import { Events as AccountEvents } from "@managers/Account/types";
import { Events as SettingsEvents } from "@managers/Settings/types";
import { Events as CodeThemeEvents } from "@managers/CodeTheme/types";
import { Events as ModuleEvents } from "@managers/Module/type";
import { Events as HotkeysEvents } from "@managers/Hotkeys/type";
import { Events as VaultEvents } from "@managers/Vault/type";
import { Events as NotificationsEvents } from "@managers/Notifications/type";
import { Events as RealmEvents } from "@managers/Realm/type";
import { ModuleState } from "@managers/Module/type";
import { HotkeysState } from "@managers/Hotkeys";
import { VaultState } from "@managers/Vault";
import { ContextEvents, ContextState } from "context/type";
import { NotificationsState } from "@managers/Notifications";
import { RealmState } from "@managers/Realm";
// Root State
export interface RootState {
	account: CharacterState;
	context: ContextState;
	settings: SettingsConfig;
	codeTheme: CodeThemeState;
	module: ModuleState;
	hotkeys: HotkeysState;
	vault: VaultState;
	notifications: NotificationsState;
	realm: RealmState;
	_drafts?: Record<
		string,
		{ path: string; data: any; select?: { key: string; value: any } }
	>;
}

export type Action =
	| AccountEvents
	| SettingsEvents
	| CodeThemeEvents
	| ContextEvents
	| ModuleEvents
	| HotkeysEvents
	| VaultEvents
	| NotificationsEvents
	| RealmEvents
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
