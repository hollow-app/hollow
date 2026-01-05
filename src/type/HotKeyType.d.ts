export type HotKeyName =
	| "Go to Realm Selector"
	| "Toggle Settings"
	| "Toggle Drag and Drop Mode"
	| "Reload App"
	| "Toggle Notifications"
	| "Toggle Expand"
	| "Toggle Editor"
	| "Toggle Vault"
	| "Accept Confirm Message"
	| "Refuse Confirm Message"
	| "Toggle Card Focus Mode";
export type HotKeyType = {
	name: HotKeyName;
	keys: string[];
	static?: boolean;
	description?: string;
	type: string;
};
