export type ExtensionState = {};

export type Events = { domain: "extension" } & (
	| {
			type: "install-extension";
			name: string;
			repo: string;
			isUpdate?: boolean;
	  }
	| {
			type: "uninstall-extension";
			name: string;
	  }
);

export type ExtensionMeta = {
	name: string;
	signed: boolean;
};
