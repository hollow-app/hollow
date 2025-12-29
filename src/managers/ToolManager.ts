import { HandType } from "@type/HandType";
import {
	HollowEvent,
	IPlugin,
	CardType,
	ToolEvents,
	CardFs,
	IStore,
	StoreType,
	ToolEventReturns,
	ToolApi,
	AppApi,
	PluginResult,
} from "@type/hollow";
import { ImageMain } from "@coretools/Image/ImageMain";
import { NotebookMain } from "@coretools/NoteBook/NotebookMain";
import { KanbanMain } from "@coretools/Kanban/KanbanMain";
import { EmbedMain } from "@coretools/Embed/EmbedMain";
import { EventsManager } from "./EventsManager";
import { ToolMetadata } from "@type/ToolMetadata";
import { hollow } from "hollow";
import DEFAULT from "@assets/configs/main.json?raw";
import { join } from "@tauri-apps/api/path";
import { Storage } from "./Storage";
import { reconcile } from "solid-js/store";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Managers } from ".";

type ToolMethods = {
	name: string;
	onCreate(card: CardType): Promise<PluginResult>;
	onDelete(card: CardType): Promise<PluginResult>;
	onLoad(card: CardType): Promise<PluginResult>;
	onUnload(name: string): Promise<PluginResult>;
	toolEvent: ToolApi;
};

type ToolMap = Map<string, ToolMethods>;

type CoreTool = (typeof hollow.coreTools)[number];

export class ToolManager {
	private readonly managers: Managers;
	private store: Storage;
	private toolMap: ToolMap = new Map();

	// INITIALIZATION
	constructor(managers: Managers) {
		this.managers = managers;
	}

	// static async create(loadUnsigned?: boolean): Promise<ToolManager> {
	// 	const instance = new ToolManager();
	// 	await instance.start(loadUnsigned);
	// 	return instance;
	// }

	async start(loadUnsigned?: boolean): Promise<void> {
		const path = await join(
			...[
				this.managers?.realm.getCurrent().location,
				".hollow",
				"main.json",
			],
		);
		this.store = await Storage.create({
			path,
			options: {
				defaults: JSON.parse(DEFAULT),
			},
		});
		let parsedData = this.getHand();
		if (loadUnsigned) {
			const unsignedTools: HandType[] =
				await this.managers?.rust.get_unsigned_plugins();
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
						this.managers?.realm.getCurrent().location,
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
				this.store.setMany(thereIsNewPlugins);
		}
		const cardsWithDates: Array<{
			createdAt: number;
			card: (typeof parsedData)[string]["cards"][number];
		}> = [];

		for (const key in parsedData) {
			const tool = parsedData[key];
			if (!tool.signed && !loadUnsigned) continue;
			const toolInstance = await this.createToolInstance(tool);
			if (toolInstance) {
				this.toolMap.set(tool.name, toolInstance);

				toolInstance.toolEvent.on(
					"card-fs",
					({ cardName }: { cardName: string }) =>
						this.getCardFs(tool.name, cardName),
				);
			}

			this.updateToolMetadata(tool.name, {
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
		hollow.setCards(cardsWithDates.map(({ card }) => card));
	}

	// loads internal tools classes
	private async createToolInstance(
		tool: HandType,
	): Promise<ToolMethods | null> {
		if (hollow.coreTools.includes(tool.name as CoreTool)) {
			const toolEvent = await this.createToolEvent(tool.name);
			const toolClass = this.createCoreTool(
				tool.name as CoreTool,
				toolEvent,
			);
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
		return this.loadTool(tool);
	}

	// loads external tools classes
	async loadTool(tool: HandType): Promise<ToolMethods | null> {
		const semiPath = await join(...["plugins", tool.name, "index.js"]);

		const toolEvent = await this.createToolEvent(tool.name);
		const toolClass = await this.managers?.rust.load_plugin({
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
	private async createToolEvent(toolName: string): Promise<ToolApi> {
		const toolEvent = new EventsManager() as HollowEvent<
			ToolEvents,
			ToolEventReturns
		>;
		const path = await join(
			...[
				this.managers?.realm.getCurrent().location,
				"main",
				toolName,
				"config.json",
			],
		);
		const str = await Storage.create({ path, options: { defaults: {} } });
		toolEvent.emit("config", str);
		return toolEvent;
	}

	// simple internal classes organizer
	private createCoreTool(name: CoreTool, toolEvent: ToolApi): IPlugin | null {
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

	// PLUGINS
	async installTool(
		name: string,
		repo: string,
		isUpdate?: boolean,
	): Promise<boolean> {
		const request = await this.managers?.rust.add_plugin({
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
				const og = this.getHand()[name];
				this.store.set(name, {
					...newTool,
					cards: og.cards,
					icon: this.getHand()[name].icon,
				});
			} else {
				this.store.set(name, newTool);
			}
			if (!isUpdate) {
				const loadRequest = await this.loadTool(newTool);
				if (loadRequest) {
					this.toolMap.set(newTool.name, loadRequest);
				}
			} else {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				this.managers?.rust.reload();
			}
		}
		return request.state;
	}

	async uninstallTool(name: string): Promise<boolean> {
		try {
			const request = await this.managers?.rust.remove_plugin({ name });

			const group = hollow.cards();

			const cards = group.filter((i) => i.data.tool === name);

			if (cards && cards.length > 0) {
				await this.deleteCard(
					cards.map((i) => i.id),
					name,
					false,
				);
				hollow.setCards(
					reconcile(group.filter((c) => c.data.tool !== name)),
				);
			}
			const icon = this.getHand()[name].icon;
			this.store.remove(name);
			const toolEvents = this.getToolEvents(name);
			const store: IStore = toolEvents.getData("config");
			await store.close();
			this.toolMap.delete(name);
			const toolPath = await join(
				this.managers?.realm.getCurrent().location,
				"main",
				name,
			);
			await this.managers?.rust.remove_dir(toolPath);
			return request;
		} catch (error) {
			console.error("[uninstallTool] FAILED", {
				name,
				error,
				stack: (error as Error)?.stack,
			});
			throw error;
		}
	}

	// INTERNAL UTILS

	private updateToolMetadata(toolName: string, metadata: ToolMetadata): void {
		this.getToolEvents(toolName)?.emit("metadata", metadata);
	}

	private getCard(toolName: string, cardId: string): CardType {
		const root = this.getHand();
		return root[toolName].cards.find((i) => i.id === cardId);
	}

	setCard(
		toolName: string,
		cardId: string,
		updates: Record<string, any>,
		rect?: { x: number; y: number; width: number; height: number },
	) {
		const root = this.getHand();
		const tool = root[toolName];
		if (!tool) return;

		tool.cards = tool.cards.map((card) =>
			card.id === cardId
				? {
						...card,
						...rect,
						data: {
							...card.data,
							...updates,
						},
					}
				: card,
		);

		this.store.set(toolName, tool);
	}
	updateCards(cardsToUpdate: { toolName: string; cards: CardType[] }[]) {
		const root = this.getHand();

		cardsToUpdate.forEach(({ toolName, cards: newCards }) => {
			const tool = root[toolName];
			if (!tool) return;
			tool.cards = tool.cards.map((c) => {
				const updatedCard = newCards.find((nc) => nc.id === c.id);
				return updatedCard ? updatedCard : c;
			});
			this.store.set(toolName, tool);
		});
	}

	private getCardFs(toolName: string, cardName: string) {
		const cfm = this.managers?.cardfile;
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

	// IPLUGIN
	async loadCard(
		cardInfo: CardType,
		toolName: string,
	): Promise<PluginResult> {
		const tool = this.toolMap.get(toolName);
		return await tool.onLoad({
			...this.getCard(toolName, cardInfo.id),
			id: cardInfo.id,
		});
	}

	async deleteCard(
		cardIds: string[],
		toolName: string,
		fs?: boolean,
	): Promise<void> {
		const root = this.getHand();
		const tool = root[toolName];
		const cards = tool.cards.filter((i) => cardIds.includes(i.id));
		const toolInstance = this.toolMap.get(toolName);
		for (const card of cards) {
			if (card.data.isPlaced) {
				const result = await toolInstance?.onUnload(card.id);
				if (!result.status) {
					console.error(result);
				}
			}
			const result = await toolInstance?.onDelete(card);
		}
		tool.cards = tool.cards.filter((i) => !cardIds.includes(i.id));
		this.store.set(toolName, tool);

		hollow.setCards(
			reconcile(hollow.cards().filter((c) => !cardIds.includes(c.id))),
		);

		fs &&
			cardIds.length === 1 &&
			(await this.managers?.rust.remove_dir(
				await join(
					...[
						this.managers?.realm.getCurrent().location,
						"main",
						toolName,
						cards[0].data.name,
					],
				),
			));
		this.updateToolMetadata(toolName, { cards: tool.cards });
	}

	async addCard(name: string, toolName: string, emoji: string) {
		const root = this.getHand();
		const tool = root[toolName];
		if (tool.cards.some((i) => i.data.name === name)) {
			hollow.events.emit("alert", {
				type: "error",
				message: "A card with that name already exists",
			});
			return;
		}
		const id = "node-" + crypto.randomUUID();
		const newCard: CardType = {
			id,
			w: 3,
			h: 3,
			// x: 10,
			// y: 10,
			style: {
				"border-radius": "10px",
				"--opacity": "100%",
				"border-color": "#3d3d3d",
				"border-width": "0px",
				background:
					"color-mix(in oklab, var(--color-secondary-05) var(--opacity), transparent)",
			},
			data: {
				name,
				emoji: emoji,
				isPlaced: false,
				isFavored: false,
				CreatedDate: new Date().toISOString(),
				tool: toolName,
			},
		};

		tool.cards = [...tool.cards, newCard];
		const result = await this.toolMap
			.get(toolName)
			?.onCreate(this.getCard(toolName, id));

		if (result.status) {
			this.store.set(toolName, tool);
			hollow.setCards(reconcile([...hollow.cards(), newCard]));
			await this.managers?.rust.create_dir(
				await join(
					this.managers?.realm.getCurrent().location,
					"main",
					tool.name,
					newCard.data.name,
				),
			);
		} else {
			console.error(result);
		}
	}

	// CARD MANIPULATION
	async togglePlacement(id: string, toolName: string) {
		const card: CardType = hollow.cards().find((c) => c.id === id);
		if (card.data.isPlaced) {
			const toolInstance = this.toolMap.get(toolName);
			const result = await toolInstance?.onUnload(id);
			if (!result.status) {
				console.error(result);
			}
		}
		this.setCard(toolName, id, { isPlaced: !card.data.isPlaced });
		hollow.setCards(
			(c) => c.id === id,
			"data",
			"isPlaced",
			(v) => !v,
		);
		const metadata: ToolMetadata = {
			cards: this.getHand()[toolName].cards,
		};
		this.updateToolMetadata(toolName, metadata);
	}

	changeEmoji(emoji: string, cardId: string, toolName: string): void {
		this.setCard(toolName, cardId, { emoji: emoji });
		hollow.setCards((c) => c.id === cardId, "data", "emoji", emoji);
		const metadata: ToolMetadata = {
			cards: this.getHand()[toolName].cards,
		};
		this.updateToolMetadata(toolName, metadata);
	}

	// EXTERNAL UTILS
	getToolEvents(tool: string): ToolApi {
		return this.toolMap.get(tool).toolEvent;
	}

	public getHand(): Record<string, HandType> {
		return this.store.getData();
	}
}
