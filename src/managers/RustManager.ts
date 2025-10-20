import { invoke } from "@tauri-apps/api/core";
import { HandType } from "@type/HandType";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { DataBase, HollowEvent, ICard, IPlugin } from "@type/hollow";

const PLUGIN_FILES = ["index.js", "manifest.json"] as const;

type FetchProps = {
	url: string;
	options?: RequestInit;
	responseType?: "json" | "text" | "blob";
};

type InstallPluginProps = {
	name: string;
	repo: string;
};

type UninstallPluginProps = {
	name: string;
};

type JoinProps = {
	path: string[];
};

type OpenDirectoryProps = {
	path: string[];
};

type vaultAddProps = {
	source: string;
	name: string;
};

type vaultRemoveProps = {
	name: string;
};

type vaultRenameProps = {
	name: string;
	new_name: string;
};

export class RustManager {
	static self: RustManager;
	private appWindow = null;

	constructor() {
		this.appWindow = getCurrentWindow();
	}

	static initiate() {
		this.self = new RustManager();
	}
	static getSelf() {
		if (!this.self) {
			this.initiate();
		}
		return this.self;
	}

	async dbg(): Promise<any> {
		return await invoke("dbg");
	}

	reload(): void {
		invoke("reload");
	}

	async get_version(): Promise<string> {
		return await invoke("get_version");
	}

	async get_platform(): Promise<string> {
		return await invoke("get_platform");
	}

	async get_unsigned_tools(): Promise<HandType[]> {
		const result: HandType[] = await invoke("get_unsigned_tools");
		return [
			...result.map((manifest) => ({
				...manifest,
				name: manifest.name.toLowerCase(),
				title: manifest.name,
				cards: [],
				signed: false,
			})),
		];
	}

	async fetch({ url, options, responseType }: FetchProps): Promise<any> {
		try {
			const response = await fetch(url, options);
			const handlers = {
				json: () => response.json(),
				text: () => response.text(),
				blob: () => response.blob(),
			};
			return await (handlers[responseType || "text"] || handlers.text)();
		} catch (error) {
			console.error("Fetch error:", error);
			return { error: (error as Error).message };
		}
	}

	async install_plugin({ name, repo }: InstallPluginProps): Promise<any> {
		let manifest = "";
		const is_dir_created = await invoke("create_plugin_directory", {
			name,
		});
		if (is_dir_created) {
			for (let i = 0; i < 2; i++) {
				try {
					const response = await fetch(
						`https://raw.githubusercontent.com/${repo}/main/${PLUGIN_FILES[i]}`,
						{
							headers: {
								Accept: "application/vnd.github.v3+json",
							},
						},
					);

					const data = await response.text();

					// make file
					if (i === 1) {
						manifest = data;
					} else {
						invoke("create_plugin_file", {
							pluginName: name,
							fileName: "index.js",
							content: data,
						});
					}
				} catch (error) {
					console.error("An error occurred:", error);
					return { state: false };
				}
			}
		} else {
			return { state: false };
		}
		return {
			state: true,
			manifest,
		};
	}

	async uninstall_plugin({ name }: UninstallPluginProps): Promise<any> {
		return await invoke("uninstall_plugin", { name });
	}

	async join({ path }: JoinProps): Promise<string> {
		return await invoke("join", { path });
	}

	open_directory({ path }: OpenDirectoryProps): void {
		invoke("open_directory", { path });
	}

	async load_plugin({
		fullPath,
		db,
	}: {
		fullPath: string;
		db: DataBase;
	}): Promise<IPlugin | null> {
		//
		const indexJS: string = await invoke("read_file", {
			path: fullPath,
		});
		// const { createRequire } = require("module");
		// const requireFromHere = createRequire(__filename);
		// const plugin = requireFromHere(fullPath);
		// const classModule = plugin.default as new (
		//         db: DataBase,
		// ) => IPlugin;
		// const instance = new classModule(db);
		if (indexJS !== "none") {
			const pluginWrapper = new Function("exports", "module", indexJS);
			const module = {
				exports: {} as {
					default: new (db: DataBase) => IPlugin;
				},
			};
			pluginWrapper(module.exports, module);
			const PluginClass = module.exports.default;
			const instance: IPlugin = new PluginClass(db);
			return {
				onCreate: (card_name: string): Promise<boolean> => {
					return instance.onCreate(card_name);
				},
				onDelete: (card_name: string): Promise<boolean> => {
					return instance.onDelete(card_name);
				},
				onLoad: (card_info: ICard, app: HollowEvent) => {
					return instance.onLoad(card_info, app);
				},
				onUnload: (name: string) => {
					return instance.onUnload(name);
				},
			};
		}
		return null;
	}

	async vault_add({ source, name }: vaultAddProps): Promise<string> {
		return await invoke("vault_add", { source, name });
	}

	async vault_remove({ name }: vaultRemoveProps): Promise<string> {
		return await invoke("vault_remove", { name });
	}
	async vault_rename({ name, new_name }: vaultRenameProps): Promise<string> {
		return await invoke("vault_rename", { name, new_name });
	}

	close_window() {
		this.appWindow.close();
	}

	maximize_window() {
		this.appWindow.toggleMaximize();
	}
	minimize_window() {
		this.appWindow.minimize();
	}
}
