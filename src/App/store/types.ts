import { CharacterState } from "@managers/Account/types";
import { CardType, TagType } from "../type/hollow"; // Check this path
import { GridStackOptions } from "gridstack";
import { SettingsConfig } from "@managers/Settings/types";
import { CodeThemeState } from "@managers/CodeTheme/types";

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
}

// Actions
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

// We need to define ContextEvents. Currently they might be mixed or not defined explicitly as a union.
// I'll define a placeholder for now or try to find them.
// In HollowContext.tsx, there are setters but no explicit "events" for context state updates in the old architecture?
// Wait, HollowContext just exposed setters: setTags, setFocus, setCards.
// So I need to CREATE actions for Context domain.

export type Action =
	| AccountEvents
	| SettingsEvents
	| CodeThemeEvents
	| ContextEvents
	| ModuleEvents
	| HotkeysEvents
	| VaultEvents
	| NotificationsEvents
	| RealmEvents;
