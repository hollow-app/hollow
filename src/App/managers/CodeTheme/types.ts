export type CodeThemeState = {
	currentTheme: string;
	db: IDBDatabase | null;
};

export type Events = { domain: "code-theme" } & {
	type: "set-theme";
	name: string;
};
