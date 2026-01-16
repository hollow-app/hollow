import { invoke } from "@tauri-apps/api/core";
import { HandType } from "@type/HandType";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AppApi, CardType, IPlugin, PluginResult, ToolApi } from "@type/hollow";
import { hollow } from "hollow";
import { importFileUrl } from "../App/managers/Vault";

const PLUGIN_FILES = ["index.js", "manifest.json", "icon.svg"] as const;

type FetchProps = {
	url: string;
	options?: RequestInit;
	responseType?: "json" | "text" | "blob";
};

type AddPluginProps = {
	name: string;
	repo: string;
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

export async function dbg(): Promise<any> {
	return await invoke("dbg");
}

export async function start_realm({ location }: startProps) {
	return await invoke("start_realm", {
		location,
	});
}

export async function first_launch() {
	invoke("first_launch");
}

export async function reload() {
	// invoke("reload");
	window.location.reload();
}

export async function get_version(): Promise<string> {
	return await invoke("get_version");
}

export async function get_platform(): Promise<string> {
	return await invoke("get_platform");
}

export async function get_unsigned_plugins(): Promise<HandType[]> {
	const result: HandType[] = await invoke("get_unsigned_plugins");
	return [
		...result.map((manifest) => ({
			...manifest,
			name: manifest.name.toLowerCase(),
			signed: false,
		})),
	];
}

export async function fetch({
	url,
	options,
	responseType,
}: FetchProps): Promise<any> {
	try {
		const response = await globalThis.fetch(url, options);
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

export async function add_plugin({ name, repo }: AddPluginProps): Promise<any> {
	const result = {
		state: true,
		manifest: "",
		icon: "",
	};
	for (const file of PLUGIN_FILES) {
		try {
			const url = `https://raw.githubusercontent.com/${repo}/main/${file}`;
			if (file === "icon.svg") {
				result.icon = await importFileUrl(url);
				continue;
			}
			const response = await globalThis.fetch(url, {
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

export async function remove_plugin({ name }: RemovePluginProps): Promise<any> {
	return await invoke("remove_plugin", { name });
}

export async function load_plugin({
	semiPath,
	toolEvent,
}: {
	semiPath: string;
	toolEvent: ToolApi;
}): Promise<IPlugin | null> {
	//
	const indexJS: string = await invoke("read_file", {
		path: semiPath,
	});
	if (indexJS !== "none") {
		const pluginWrapper = new Function("exports", "module", indexJS);
		const module = {
			exports: {} as {
				default: new (app: AppApi, toolEvent: ToolApi) => IPlugin;
			},
		};
		pluginWrapper(module.exports, module);
		const PluginClass = module.exports.default;
		const instance: IPlugin = new PluginClass(hollow.events, toolEvent);
		return {
			onCreate: (card: CardType): Promise<PluginResult> => {
				return instance.onCreate(card);
			},
			onDelete: (card: CardType): Promise<PluginResult> => {
				return instance.onDelete(card);
			},
			onLoad: (card_info: CardType): Promise<PluginResult> => {
				return instance.onLoad(card_info);
			},
			onUnload: (id: string): Promise<PluginResult> => {
				return instance.onUnload(id);
			},
		};
	}
	return null;
}

export async function vault_add(props: vaultAddProps): Promise<string[]> {
	return await invoke("vault_add", props);
}
export async function vault_remove(props: vaultRemoveProps): Promise<string> {
	return await invoke("vault_remove", props);
}

export async function vault_add_url(props: { url: string }): Promise<string> {
	return await invoke("vault_add_url", props);
}

export async function create_dir(path: string) {
	const relativePath = getRelativePath(path);
	await invoke("create_dir", { paths: [relativePath] });
}

export async function remove_dir(path: string) {
	const relativePath = getRelativePath(path);
	await invoke("remove_dir", { path: relativePath });
}

function getRelativePath(path: string): string {
	// if (path.startsWith(realmLocation)) {
	// 	let relative = path.slice(realmLocation.length);
	// 	if (relative.startsWith("/") || relative.startsWith("\\")) {
	// 		relative = relative.slice(1);
	// 	}
	// 	return relative;
	// }
	return path;
}

export function close_window() {
	getCurrentWindow().close();
}

export function maximize_window() {
	getCurrentWindow().toggleMaximize();
}
export function minimize_window() {
	getCurrentWindow().minimize();
}
