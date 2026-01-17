import { join } from "@tauri-apps/api/path";
import { hollow } from "hollow";
import { Storage } from "@managers/Storage";
import { CoreTool, Events, ModuleState, ToolMap, ToolMethods } from "./type";
import DEFAULT from "@assets/configs/main.json?raw";
import { HandType } from "@type/HandType";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
	HollowEvent,
	IPlugin,
	CardType,
	ToolEvents,
	CardFs,
	IStore,
	ToolEventReturns,
	ToolApi,
	AppApi,
	PluginResult,
} from "@type/hollow";
import { ImageMain } from "@coretools/Image/ImageMain";
import { NotebookMain } from "@coretools/NoteBook/NotebookMain";
import { KanbanMain } from "@coretools/Kanban/KanbanMain";
import { EmbedMain } from "@coretools/Embed/EmbedMain";
import { EventsManager } from "../EventsManager";
import { ToolMetadata } from "@type/ToolMetadata";
import { getCurrentRealm } from "@managers/Realm";
import * as cfm from "@managers/CardFS";
import {
	add_plugin,
	create_dir,
	get_unsigned_plugins,
	load_plugin,
	reload,
	remove_dir,
	remove_plugin,
} from "../../../Hollow/rust";

export let store: Storage | null = null;
export let toolMap: ToolMap = new Map();

export function setupModule(dispatch: (action: any) => void) {
	hollow.pevents.on("post-realm", async () => {
		const loadUnsigned = false;
		const realmLocation = getCurrentRealm().location;
		const path = await join(...[realmLocation, ".hollow", "main.json"]);
		store = await Storage.create({
			path,
			options: {
				defaults: JSON.parse(DEFAULT),
			},
		});
		let parsedData = store.getData();
		if (loadUnsigned) {
			const unsignedTools: HandType[] = await get_unsigned_plugins();
			const thereIsNewPlugins = {};
			for (const tool of unsignedTools) {
				const targetTool = parsedData[tool.name];
				if (targetTool) {
					parsedData[tool.name] = {
						...targetTool,
						...tool,
					};
				} else {
					const iconPath = await join(
						realmLocation,
						"plugins",
						tool.name,
						"icon.svg",
					);
					const ntool = {
						...tool,
						cards: [],
						icon: convertFileSrc(iconPath),
					};
					parsedData[tool.name] = ntool;
					thereIsNewPlugins[tool.name] = ntool;
				}
			}
			Object.keys(thereIsNewPlugins).length > 0 &&
				store.setMany(thereIsNewPlugins);
		}
		const cardsWithDates: Array<{
			createdAt: number;
			card: (typeof parsedData)[string]["cards"][number];
		}> = [];

		for (const key in parsedData) {
			const tool = parsedData[key];
			if (!tool.signed && !loadUnsigned) continue;
			const toolInstance = await createToolInstance(tool);
			if (toolInstance) {
				toolMap.set(tool.name, toolInstance);

				toolInstance.toolEvent.on(
					"card-fs",
					({ cardName }: { cardName: string }) =>
						getCardFs(tool.name, cardName),
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
	});
}

export async function moduleEffects(action: Events, state: ModuleState) {
	if (action.domain !== "module") return;

	switch (action.type) {
		case "install-module": {
			const { name, repo, isUpdate } = action;
			const request = await add_plugin({
				name: name,
				repo: repo,
			});
			if (request.state) {
				const manifest = JSON.parse(request.manifest);
				const newTool: HandType = {
					...manifest,
					icon: request.icon,
					name: manifest.name.toLowerCase(),
					cards: [],
					signed: true,
				};

				if (isUpdate) {
					const og = getHand()[name];
					store?.set(name, {
						...newTool,
						cards: og.cards,
						icon: getHand()[name].icon,
					});
				} else {
					store?.set(name, newTool);
				}
				if (!isUpdate) {
					const loadRequest = await loadTool(newTool);
					if (loadRequest) {
						toolMap.set(newTool.name, loadRequest);
					}
				} else {
					await new Promise((resolve) => setTimeout(resolve, 2000));
					reload();
				}
			}
			break;
		}
		case "uninstall-module": {
			const { name } = action;
			try {
				const request = await remove_plugin({ name });

				const group = state.instances; // Use state.instances as source of truth for cards before removal?
				// Actually, reducer has already removed them from state.instances if this runs after.
				// But we need to know which cards were removed to call onDelete.
				// This is a problem if state is already updated.
				// Assuming state is the NEW state, the cards are gone.
				// We need to look at the STORE (which hasn't been updated yet) to find the cards to delete.

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
				store?.remove(name);
				const toolEvents = getToolEvents(name);
				const storeConfig: IStore = toolEvents.getData("config");
				await storeConfig.close();
				toolMap.delete(name);
				const toolPath = await join("main", name);
				await remove_dir(toolPath);
				return true;
			} catch (error) {
				console.error("[uninstallTool] FAILED", {
					name,
					error,
					stack: (error as Error)?.stack,
				});
				return false;
			}
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

// loads internal tools classes
async function createToolInstance(tool: HandType): Promise<ToolMethods | null> {
	if (hollow.coreTools.includes(tool.name as CoreTool)) {
		const toolEvent = await createToolEvent(tool.name);
		const toolClass = createCoreTool(tool.name as CoreTool, toolEvent);
		if (!toolClass) return null;

		return {
			name: tool.name,
			onCreate: toolClass.onCreate.bind(toolClass),
			onDelete: toolClass.onDelete.bind(toolClass),
			onLoad: toolClass.onLoad.bind(toolClass),
			onUnload: toolClass.onUnload.bind(toolClass),
			toolEvent,
		};
	}
	return loadTool(tool);
}

// loads external tools classes
export async function loadTool(tool: HandType): Promise<ToolMethods | null> {
	const semiPath = await join(...["plugins", tool.name, "index.js"]);

	const toolEvent = await createToolEvent(tool.name);
	const toolClass = await load_plugin({
		semiPath: semiPath,
		toolEvent,
	});

	if (!toolClass) return null;
	return {
		name: tool.name,
		onCreate: toolClass.onCreate.bind(toolClass),
		onDelete: toolClass.onDelete.bind(toolClass),
		onLoad: toolClass.onLoad.bind(toolClass),
		onUnload: toolClass.onUnload.bind(toolClass),
		toolEvent,
	};
}

// create the HollowEvent of a singal tool;
async function createToolEvent(toolName: string): Promise<ToolApi> {
	const toolEvent = new EventsManager() as HollowEvent<
		ToolEvents,
		ToolEventReturns
	>;
	const path = await join(
		...[getCurrentRealm().location, "main", toolName, "config.json"],
	);
	const str = await Storage.create({ path, options: { defaults: {} } });
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

// INTERNAL UTILS

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
	return toolMap.get(tool).toolEvent;
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
