import { hollow } from "hollow";
import { CoreTool } from "../Module/type";
import { join } from "@tauri-apps/api/path";
import {
	add_plugin,
	get_unsigned_plugins,
	load_plugin,
	remove_plugin,
} from "@rust";
import {
	AppApi,
	CardType,
	IPlugin,
	IStore,
	ModuleCapability,
	PanelCapability,
	PluginCapability,
	rawPluginCapability,
	ToolApi,
	ToolEvents,
} from "@app/type/hollow";
import { EventsManager } from "../EventsManager";
import { getCurrentRealm } from "@shared/managers/Realm";
import { Storage } from "../Storage";
import { ImageMain } from "@app/(Core Tools)/Image/ImageMain";
import { Events, ExtensionMeta, ExtensionState } from "./type";
import { _dispatch } from "@shared/store/effects";
import { NotebookMain } from "@app/(Core Tools)/NoteBook/NotebookMain";
import { KanbanMain } from "@app/(Core Tools)/Kanban/KanbanMain";
import { EmbedMain } from "@app/(Core Tools)/Embed/EmbedMain";
import { ModuleMain } from "./utils/ModuleMain";
import { LayoutMain } from "./utils/LayoutMain";
import { buildPluginHTML, buildPluginIframe } from "./utils";
import { sendIframeRequest } from "@app/utils";

// TODO needs to be inside an uneditable place , local file
// maybe add this to extension state as well
const savedExtensions = localStorage.getItem("extensions");
const extensions: ExtensionMeta[] = savedExtensions
	? JSON.parse(savedExtensions)
	: [
			{ name: "image", signed: true },
			{ name: "notebook", signed: true },
			{ name: "kanban", signed: true },
			{ name: "embed", signed: true },
		];
const pluginEvents: Record<string, ToolApi> = {};

export async function setupExtension(dispatch: (action: any) => void) {
	hollow.pevents.on("post-realm", async () => {
		await hollow.pevents.emitAsync("pre-capabilities");
		let capabilities = [];
		for (const ext of extensions) {
			const capa = await loadPlugin(ext.name);
			capabilities = [
				...capabilities,
				...capa.map((i) => ({
					...i,
					meta: { ...i.meta, source: ext.name },
				})),
			];
		}
		const loadUnsigned = true;
		if (loadUnsigned) {
			const unsignedExtensions = await get_unsigned_plugins();
			for (const ext of unsignedExtensions) {
				const capa = await loadPlugin(ext.name);
				capabilities = [
					...capabilities,
					...capa.map((i) => ({
						...i,
						meta: { ...i.meta, source: ext.name },
					})),
				];
			}
		}
		hollow.pevents.emit("capabilities", capabilities);
		await hollow.pevents.emitAsync("post-capabilities");
		hollow.pevents.on(
			"push-capabilities",
			(capabilities: PluginCapability[]) => {
				const prev = hollow.pevents.getData("capabilities") ?? [];
				for (const capa of capabilities) {
					const index = prev.findIndex(
						(i) => i.meta.name === capa.meta.name,
					);
					if (index !== -1) {
						prev[index] = capa;
					} else {
						prev.push(capa);
					}
				}
				hollow.pevents.emit("capabilities", prev);
			},
		);
	});
}

export async function extensionEffects(action: Events, state: ExtensionState) {
	if (action.domain !== "extension") return;
	switch (action.type) {
		case "install-extension": {
			const { name, repo, isUpdate } = action;
			const request = await add_plugin({
				name: name,
				repo: repo,
			});
			if (request.state) {
				const extensionCapabilities = await loadPlugin(name);
				hollow.pevents.emit(
					"push-capabilities",
					extensionCapabilities.map((i) => ({
						...i,
						meta: { ...i.meta, source: name },
					})),
				);
				if (isUpdate) {
					// TODO rethink this method of updating already placed instances
					// show an alert that says for changes to take place you need to reload
					// await new Promise((resolve) => setTimeout(resolve, 2000));
					// reload();
				}
			}
			break;
		}
		case "uninstall-extension": {
			const { name } = action;
			try {
				const request = await remove_plugin({ name });
				if (request) {
					const capabilities = hollow.pevents.getData("capabilities");
					const capas = capabilities.filter(
						(i) => i.meta.source === name,
					);
					// TODO should remove the capabilities from thier respected Managers
					_dispatch({
						domain: "module",
						type: "remove-modules",
						modules: capas.map((i) => i.meta.name),
					});
				}
			} catch (error) {
				console.error("[uninstallTool] FAILED", {
					name,
					error,
					stack: (error as Error)?.stack,
				});
				return false;
			}
		}
	}
}
async function loadPlugin(extension: string): Promise<PluginCapability[]> {
	const toolEvent = await createToolEvent(extension);
	pluginEvents[extension] = toolEvent;
	if (hollow.coreTools.includes(extension as CoreTool)) {
		const pluginObj = createCoreTool(extension as CoreTool, toolEvent);
		if (!pluginObj) return null;
		return pluginObj.capabilities;
	} else {
		const semiPath = await join(...["plugins", extension, "index.json"]);
		const pluginObj = await load_plugin({
			semiPath: semiPath,
		});
		if (!pluginObj) return null;
		// PLUGIN IFRAME
		const iframe = buildPluginIframe({
			module: toolEvent,
			script: pluginObj.script,
			visual: false,
		});
		const capas = pluginObj.capabilities.map((i) =>
			polishICapability(i, toolEvent, iframe),
		);
		return capas;
	}
}
export function getPluginEvents(name: string) {
	return pluginEvents[name];
}

// create the HollowEvent of a singal tool;
async function createToolEvent(toolName: string): Promise<ToolApi> {
	const toolEvent = new EventsManager<ToolEvents, ToolEvents>();
	const path = await join(
		...[getCurrentRealm().location, "main", toolName, "config.json"],
	);
	const str = await Storage.create({ path, options: { defaults: {} } });
	// const store: IStore = {
	// 	close: str.close.bind(str),
	// 	get: str.get.bind(str),
	// 	getData: str.getData.bind(str),
	// 	keys: str.keys.bind(str),
	// 	reload: str.reload.bind(str),
	// 	remove: str.remove.bind(str),
	// 	save: str.save.bind(str),
	// 	set: str.set.bind(str),
	// 	setMany: str.setMany.bind(str),
	// };
	toolEvent.emit("config", str);
	return toolEvent;
}

// simple internal classes organizer
function createCoreTool(name: CoreTool, toolEvent: ToolApi): IPlugin | null {
	const toolMap: Record<
		CoreTool,
		new (app: AppApi, toolEvent: ToolApi) => IPlugin
	> = {
		image: ImageMain,
		notebook: NotebookMain,
		kanban: KanbanMain,
		embed: EmbedMain,
	};
	return new toolMap[name](hollow.events, toolEvent);
}

// utils
function polishICapability(
	raw: rawPluginCapability,
	toolEvent: ToolApi,
	iframe: HTMLIFrameElement,
): PluginCapability {
	switch (raw.kind) {
		case "module":
			return {
				...raw,
				kind: "module",
				handler: polishModuleCapability(raw, toolEvent, iframe),
			};
		case "panel":
			return {
				...raw,
				kind: "panel",
				handler: polishLayoutCapability(raw, toolEvent, iframe),
			};
	}
}
function polishModuleCapability(
	raw: rawPluginCapability,
	toolEvent: ToolApi,
	iframe: HTMLIFrameElement,
): ModuleCapability {
	// const store: IStore = toolEvent.getData("config");
	//
	const moduleMain = new ModuleMain(iframe, raw, hollow.events, toolEvent);
	return {
		onCreate: moduleMain.onCreate.bind(moduleMain),
		onDelete: moduleMain.onDelete.bind(moduleMain),
		onLoad: moduleMain.onLoad.bind(moduleMain),
		onUnload: moduleMain.onUnload.bind(moduleMain),
	};
}
function polishLayoutCapability(
	raw: rawPluginCapability,
	toolEvent: ToolApi,
	iframe: HTMLIFrameElement,
): PanelCapability {
	// const store: IStore = toolEvent.getData("config");
	//
	return new LayoutMain();
}
