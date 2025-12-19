import { invoke } from "@tauri-apps/api/core";
import { HandType } from "@type/HandType";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
	CardType,
	HollowEvent,
	IPlugin,
	ToolApi,
	ToolEventReturns,
	ToolEvents,
} from "@type/hollow";
import { exists, mkdir, remove } from "@tauri-apps/plugin-fs";
import VaultManager from "./VaultManager";

const PLUGIN_FILES = ["index.js", "manifest.json", "icon.svg"] as const;

type FetchProps = {
	url: string;
	options?: RequestInit;
	responseType?: "json" | "text" | "blob";
};

type AddPluginProps = {
	name: string;
	repo: string;
	isUpdate?: boolean;
};

type RemovePluginProps = {
	name: string;
};

type vaultAddProps = {
	paths: string[];
};

type vaultRemoveProps = {
	names: string[];
};

type startProps = {
	location: string;
};

export class RustManager {
	private static self: RustManager;
	private appWindow = null;

	private constructor() {
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

	async start_realm({ location }: startProps) {
		return await invoke("start_realm", {
			location,
		});
	}

	async first_launch() {
		invoke("first_launch");
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

	async get_unsigned_plugins(): Promise<HandType[]> {
		const result: HandType[] = await invoke("get_unsigned_tools");
		return [
			...result.map((manifest) => ({
				...manifest,
				name: manifest.name.toLowerCase(),
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

	async add_plugin({ name, repo, isUpdate }: AddPluginProps): Promise<any> {
		const result = {
			state: true,
			manifest: "",
			icon: "",
		};
		for (const file of PLUGIN_FILES) {
			try {
				const url = `https://raw.githubusercontent.com/${repo}/main/${file}`;
				if (file === "icon.svg") {
					!isUpdate &&
						(result.icon =
							await VaultManager.getSelf().addUrlItem(url));
					continue;
				}
				const response = await fetch(url, {
					headers: {
						Accept: "application/vnd.github.v3+json",
					},
				});

				const data = await response.text();

				// make file
				if (file === "manifest.json") {
					result.manifest = data;
				} else if (file === "index.js") {
					invoke("add_plugin", {
						pluginName: name.toLowerCase(),
						content: data,
					});
				}
			} catch (error) {
				console.error("An error occurred:", error);
				return { state: false };
			}
		}
		return result;
	}

	async remove_plugin({ name }: RemovePluginProps): Promise<any> {
		return await invoke("remove_plugin", { name });
	}

	async load_plugin({
		fullPath,
		toolEvent,
	}: {
		fullPath: string;
		toolEvent: ToolApi;
	}): Promise<IPlugin | null> {
		//
		const indexJS: string = await invoke("read_file", {
			path: fullPath,
		});
		if (indexJS !== "none") {
			const pluginWrapper = new Function("exports", "module", indexJS);
			const module = {
				exports: {} as {
					default: new (app: ToolApi) => IPlugin;
				},
			};
			pluginWrapper(module.exports, module);
			const PluginClass = module.exports.default;
			const instance: IPlugin = new PluginClass(toolEvent);
			return {
				onCreate: (card: CardType): Promise<boolean> => {
					return instance.onCreate(card);
				},
				onDelete: (card: CardType): Promise<boolean> => {
					return instance.onDelete(card);
				},
				onLoad: (card_info: CardType) => {
					return instance.onLoad(card_info);
				},
				onUnload: (id: string) => {
					return instance.onUnload(id);
				},
			};
		}
		return null;
	}

	async vault_add(props: vaultAddProps): Promise<string[]> {
		return await invoke("vault_add", props);
	}
	async vault_remove(props: vaultRemoveProps): Promise<string> {
		return await invoke("vault_remove", props);
	}

	async vault_add_url(props: { url: string }): Promise<string> {
		return await invoke("vault_add_url", props);
	}

	// TODO is it needed?
	async create_dir(path: string) {
		const doesExist = await exists(path);
		if (!doesExist) {
			await mkdir(path, { recursive: true });
		}
	}

	async remove_dir(path: string) {
		const doesExist = await exists(path);
		if (doesExist) {
			await remove(path, { recursive: true });
		}
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
