// Re-export functions that don't need store access
export {
	toggleRealm,
	selectRealmOnStartup,
	setSelectRealmOnStartup,
} from "@shared/managers/Realm";

// Re-export types
export type { RealmState, Events } from "@shared/managers/Realm";
