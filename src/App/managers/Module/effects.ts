import { join } from "@tauri-apps/api/path";
import { hollow } from "../../../hollow";
import { Storage } from "@app/managers/Storage";
import { Events, ModuleState, ToolMap, ToolMethods } from "./type";
import DEFAULT from "@assets/configs/main.json?raw";
import { HandType } from "@app/type/HandType";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
	CardType,
	ToolEvents,
	CardFs,
	IStore,
	ToolApi,
	PluginResult,
} from "@app/type/hollow";
import { EventsManager } from "../EventsManager";
import { ToolMetadata } from "@app/type/ToolMetadata";
import { getCurrentRealm } from "@app/managers/Settings/effects.ts";
import * as cfm from "@app/managers/CardFS";
import { create_dir, remove_dir } from "@rust";
import { getPluginEvents } from "../Extension/effects";

export let store: Storage | null = null;
export let toolMap: ToolMap = new Map();

export function setupModule(dispatch: (action: any) => void) {
	hollow.pevents.on("post-capabilities", async () => {
		const capas = hollow.pevents
			.getData("capabilities")
			.filter((i) => i.kind === "module");
		const realmLocation = getCurrentRealm().location;
		const path = await join(...[realmLocation, ".hollow", "main.json"]);
		store = await Storage.create({
			path,
			options: {
				defaults: JSON.parse(DEFAULT),
			},
		});
		let parsedData = store.getData();
		const cardsWithDates: Array<{
			createdAt: number;
			card: (typeof parsedData)[string]["cards"][number];
		}> = [];

		for (const capa of capas) {
			const key = capa.meta.source;
			let tool: HandType | undefined = parsedData[key];
			// the capa doesn't exist among the saved in main.json
			if (!tool) {
				tool = {
					name: capa.meta.name,
					version: capa.meta.version,
					description: capa.meta.description,
					icon: capa.meta.icon,
					cards: [],
				};
				console.log(capa.meta.name, " icon : ", capa.meta.icon);
				store.set(capa.meta.name, tool);
			}
			const targetModule = capas.find((i) => i.meta.name === tool.name);
			const moduleTools = await createModuleTools(
				targetModule.meta.source,
				tool.name,
			);
			const toolInstance: ToolMethods = {
				...targetModule.handler,
				tools: moduleTools,
				name: tool.name,
			};
			if (toolInstance) {
				toolMap.set(tool.name, toolInstance);
				toolInstance.tools.events.on(
					"card-fs",
					({ cardName }: { cardName: string }) =>
						getCardFs(tool.name, cardName),
					{ source: "source" },
				);
			}

			updateToolMetadata(tool.name, {
				cards: tool.cards ?? [],
			});

			for (const c of tool.cards) {
				cardsWithDates.push({
					createdAt: new Date(c.data.CreatedDate).getTime(),
					card: {
						...c,
						data: {
							...c.data,
							tool: tool.name,
						},
					},
				});
			}
		}
		cardsWithDates.sort((a, b) => a.createdAt - b.createdAt);
		const tCards = cardsWithDates.map(({ card }) => card);
		dispatch({
			domain: "module",
			type: "set-instances",
			instances: tCards,
		});
		hollow.pevents.on("push-capabilities", async (capabilities) => {
			const newModules = capabilities.filter((i) => i.kind === "module");
			if (newModules.length > 0) {
				for (const capa of newModules) {
					dispatch({
						domain: "module",
						type: "add-module",
						capability: capa.handler,
						meta: capa.meta,
					});
				}
			}
		});
	});
}

export async function moduleEffects(action: Events, state: ModuleState) {
	if (action.domain !== "module") return;
	switch (action.type) {
		case "add-modules": {
			const { modules } = action;
			const storeChanges: Record<string, HandType> = {};
			for (const module of modules) {
				const { meta, capability } = module;
				const isUpdate = getHand()[meta.name];
				const newTool: HandType = {
					...meta,
					cards: [],
					signed: true,
				};
				if (isUpdate) {
					storeChanges[meta.name] = {
						...newTool,
						cards: isUpdate.cards,
					};
				} else {
					storeChanges[meta.name] = newTool;
					toolMap.set(newTool.name, {
						...capability,
						name: meta.name,
						tools: await createModuleTools(meta.source, meta.name),
					});
				}
			}
			store.setMany(storeChanges);
			break;
		}
		case "remove-modules": {
			const { modules } = action;
			try {
				const str = store.getStore();
				for (const name of modules) {
					const root = getHand();
					const tool = root[name];
					if (!tool) break; // Already removed?
					const cards = tool.cards; // Cards from store
					if (cards && cards.length > 0) {
						const toolInstance = toolMap.get(name);
						for (const card of cards) {
							if (card.data.isPlaced) {
								const result = await toolInstance?.onUnload(
									card.id,
								);
								if (!result.status) {
									console.error(result);
								}
							}
							await toolInstance?.onDelete(card);
						}
					}
					await str.delete(name);
					const toolEvents = getToolEvents(name);
					const storeConfig: IStore = toolEvents.getData("config");
					await storeConfig.close();
					toolMap.delete(name);
					const toolPath = await join("main", name);
					await remove_dir(toolPath);
					return true;
				}
			} catch (error) {
				console.error("[uninstallTool] FAILED", {
					modules,
					error,
					stack: (error as Error)?.stack,
				});
				return false;
			}
			break;
		}
		case "add-instance": {
			const { name, toolName, emoji } = action;
			// Reducer has already added the card to state.instances.
			// We need to find it and save to store.

			const root = getHand();
			const tool = root[toolName];

			// Find the new card in state.instances
			const newCard = state.instances.find(
				(c) => c.data.tool === toolName && c.data.name === name,
			);

			if (!newCard) {
				// If not found, maybe reducer rejected it (duplicate name)?
				// Or maybe state is old?
				// If reducer rejected it, we do nothing.
				if (tool.cards.some((i) => i.data.name === name)) {
					hollow.events.emit("alert", {
						type: "error",
						message: "A card with that name already exists",
					});
				}
				return;
			}

			// Sync store with state
			tool.cards = state.instances.filter(
				(c) => c.data.tool === toolName,
			);
			store?.set(toolName, tool);

			const result = await toolMap.get(toolName)?.onCreate(newCard);

			if (result.status) {
				await create_dir(
					await join("main", tool.name, newCard.data.name),
				);
			} else {
				console.error(result);
			}
			break;
		}
		case "remove-instance": {
			const { cardIds, toolName, fs } = action;

			const root = getHand();
			const tool = root[toolName];
			const cardsToDelete = tool.cards.filter((i) =>
				cardIds.includes(i.id),
			);

			const toolInstance = toolMap.get(toolName);
			for (const card of cardsToDelete) {
				if (card.data.isPlaced) {
					const result = await toolInstance?.onUnload(card.id);
					if (!result.status) {
						console.error(result);
					}
				}
				await toolInstance?.onDelete(card);
			}

			// Sync store with state
			tool.cards = state.instances.filter(
				(c) => c.data.tool === toolName,
			);
			store?.set(toolName, tool);

			if (fs && cardIds.length === 1 && cardsToDelete.length > 0) {
				await remove_dir(
					await join(
						...[
							getCurrentRealm().location,
							"main",
							toolName,
							cardsToDelete[0].data.name,
						],
					),
				);
			}
			updateToolMetadata(toolName, { cards: tool.cards });
			break;
		}
		case "update-instance": {
			const { toolName } = action;
			const root = getHand();
			const tool = root[toolName];
			if (!tool) return;

			// Sync store with state
			tool.cards = state.instances.filter(
				(c) => c.data.tool === toolName,
			);
			store?.set(toolName, tool);
			break;
		}
		case "toggle-instance": {
			const { id, toolName } = action;
			// We need the card *before* toggle to check isPlaced?
			// Or we can check the *new* state.
			// If new state isPlaced is false, it was true.
			// But we need to call onUnload if it WAS placed.
			// We can look at the STORE (old state) to see if it was placed.

			const root = getHand();
			const tool = root[toolName];
			const oldCard = tool.cards.find((c) => c.id === id);

			if (oldCard && oldCard.data.isPlaced) {
				const toolInstance = toolMap.get(toolName);
				const result = await toolInstance?.onUnload(id);
				if (!result.status) {
					console.error(result);
				}
			}

			// Sync store with state
			tool.cards = state.instances.filter(
				(c) => c.data.tool === toolName,
			);
			store?.set(toolName, tool);

			const metadata: ToolMetadata = {
				cards: tool.cards,
			};
			updateToolMetadata(toolName, metadata);
			break;
		}
		case "change-emoji": {
			const { toolName } = action;
			const root = getHand();
			const tool = root[toolName];
			if (!tool) return;

			// Sync store with state
			tool.cards = state.instances.filter(
				(c) => c.data.tool === toolName,
			);
			store?.set(toolName, tool);

			const metadata: ToolMetadata = {
				cards: tool.cards,
			};
			updateToolMetadata(toolName, metadata);
			break;
		}
		case "update-instances": {
			const { cardsToUpdate } = action;
			// cardsToUpdate contains { toolName, cards }.
			// We should iterate and update store for each tool involved.

			cardsToUpdate.forEach(({ toolName }) => {
				const root = getHand();
				const tool = root[toolName];
				if (!tool) return;

				// Sync store with state
				tool.cards = state.instances.filter(
					(c) => c.data.tool === toolName,
				);
				store?.set(toolName, tool);
			});
			break;
		}
		case "load-instance": {
			const { cardInfo, toolName } = action;
			const tool = toolMap.get(toolName);
			// We need the card from state or store.
			const card = state.instances.find((c) => c.id === cardInfo.id);
			if (card) {
				await tool.onLoad({
					...card,
					id: cardInfo.id,
				});
			}
			break;
		}
	}
}

// create the HollowEvent of a singal tool;
async function createModuleTools(
	pluginName: string,
	toolName: string,
): Promise<{ events: ToolApi; store: IStore }> {
	const toolEvent = getPluginEvents(pluginName);
	const path = await join(
		...[getCurrentRealm().location, "main", toolName, "config.json"],
	);
	const str = await Storage.create({ path, options: { defaults: {} } });
	return { events: toolEvent, store: str };
}

function updateToolMetadata(toolName: string, metadata: ToolMetadata): void {
	getToolEvents(toolName)?.emit("metadata", metadata);
}

function getCard(toolName: string, cardId: string): CardType {
	const root = getHand();
	return root[toolName].cards.find((i) => i.id === cardId);
}

function getCardFs(toolName: string, cardName: string) {
	const cardFs: CardFs = {
		exists: (path) => cfm.exists({ toolName, cardName, path }),
		readFile: (path) => cfm.readFile({ toolName, cardName, path }),
		writeFile: (path, contents) =>
			cfm.writeFile({ toolName, cardName, path, contents }),
		mkdir: (path) => cfm.mkdir({ toolName, cardName, path }),
		readDir: (path) => cfm.readDir({ toolName, cardName, path }),
		remove: (path) => cfm.remove({ toolName, cardName, path }),
		rename: (path, newPath) =>
			cfm.rename({ toolName, cardName, path, newPath }),
	};
	return cardFs;
}

// EXTERNAL UTILS
export function getToolEvents(tool: string): ToolApi {
	return toolMap.get(tool).tools.events;
}
export function getToolStore(tool: string): IStore {
	return toolMap.get(tool).tools.store;
}

export function getHand(): Record<string, HandType> {
	return store?.getData();
}

export async function loadCard(
	cardInfo: CardType,
	toolName: string,
): Promise<PluginResult> {
	const tool = toolMap.get(toolName);
	return await tool.onLoad({
		...getCard(toolName, cardInfo.id),
		id: cardInfo.id,
	});
}
