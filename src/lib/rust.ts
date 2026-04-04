import { invoke } from "@tauri-apps/api/core";
import { HandType } from "@app/type/HandType";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
	AppApi,
	CardType,
	IPlugin,
	PluginResult,
	rawIPlugin,
	rawPluginCapability,
	ToolApi,
} from "@app/type/hollow";
import { hollow } from "../hollow";
import { importFileUrl } from "../App/managers/Vault";
import { ClientUser } from "center";
import { join } from "@tauri-apps/api/path";
import { Realm } from "@app/type/Realm";

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
export async function check_stronghold(): Promise<string> {
	return await invoke("check_stronghold");
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
export async function get_unsigned_plugins(): Promise<rawIPlugin[]> {
	const manifests: rawIPlugin[] = await invoke("get_unsigned_plugins");
	try {
		for (const plg of manifests) {
			plg.capabilities = await exchangePluginHandlers(plg);
		}
		return [
			...manifests.map((manifest) => ({
				...manifest,
				name: manifest.name.toLowerCase(),
				signed: false,
			})),
		];
	} catch (e) {
		console.log("failed::::", e);
		return [];
	}
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
}: {
	semiPath: string;
}): Promise<rawIPlugin | null> {
	//
	const indexJSON: string = await invoke("read_file", {
		path: semiPath,
	});
	if (indexJSON !== "none") {
		const plugin: rawIPlugin = JSON.parse(indexJSON);
		plugin.capabilities = await exchangePluginHandlers(plugin);
		plugin.script = await invoke("read_file", {
			path: await join("plugins", plugin.name, "index.js"),
		});
		return plugin;
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
// auth
/** @deprecated Use Auth class instead */
export async function is_signed_in(): Promise<{
	state: boolean;
	type: "online" | "offline";
}> {
	return await invoke("is_signed_in");
}
/** @deprecated Use Auth class instead */
export async function sign_out() {
	return await invoke("sign_out");
}
/** @deprecated Use Auth class instead */
export async function sign_in() {
	return await invoke("signin");
}
/** @deprecated Use Auth class instead */
export async function get_user(): Promise<ClientUser> {
	return await invoke("get_user");
}

// utils

async function exchangePluginHandlers(
	plugin: rawIPlugin,
): Promise<rawPluginCapability[]> {
	return await Promise.all(
		plugin.capabilities.map(async (cap) => ({
			...cap,
			handler: await invoke("read_file", {
				path: await join("plugins", plugin.name, cap.handler),
			}),
		})),
	);
}

//

export async function get_current_realm(): Promise<Realm | null> {
	return invoke<Realm | null>("get_current_realm");
}

export async function has_realm_selected(): Promise<boolean> {
	return invoke<boolean>("has_realm_selected");
}

export async function get_realms(): Promise<Realm[]> {
	return invoke<Realm[]>("get_realms");
}

export async function select_realm(id: string): Promise<void> {
	return invoke("select_realm", { id });
}

export async function add_realm(realm: Realm): Promise<void> {
	return invoke("add_realm", { realm });
}

export async function update_realm(realm: Realm): Promise<void> {
	return invoke("update_realm", { updated_realm: realm });
}

export async function remove_realm(id: string): Promise<void> {
	return invoke("remove_realm", { id });
}

export async function toggle_select_realm_on_startup(): Promise<boolean> {
	return invoke<boolean>("toggle_select_realm_on_startup");
}

export async function open_main_window(): Promise<void> {
	return invoke("open_main_window");
}

export async function open_realm_selector(): Promise<void> {
	return invoke("open_realm_selector");
}

export async function get_realms_config(): Promise<any> {
	return invoke("get_realms_config");
}
export async function update_realms_config(config: any) {
	try {
		await invoke("update_full_store", { newData: config });
		console.log("Configuration synced to disk!");
	} catch (error) {
		console.error("Failed to sync settings:", error);
	}
}
