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
import { RustManager } from "@managers/RustManager";
import { RealmManager } from "./RealmManager";
import { hollow } from "hollow";
import DEFAULT from "@assets/configs/main.json?raw";
import { join } from "@tauri-apps/api/path";
import { Storage } from "./Storage";
import { CardFileManager } from "./CardFileManager";
import { reconcile } from "solid-js/store";
import { convertFileSrc } from "@tauri-apps/api/core";

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
	private store: Storage;
	private toolMap: ToolMap;

	// INITIALIZATION
	private constructor() {
		this.toolMap = new Map();
	}

	static async create(loadUnsigned?: boolean): Promise<ToolManager> {
		const instance = new ToolManager();
		await instance.start(loadUnsigned);
		return instance;
	}

	private async start(loadUnsigned?: boolean): Promise<void> {
		const path = await join(
			...[
				RealmManager.getSelf().getCurrent().location,
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
		let parsedData: HandType[] = this.getHand();
		if (loadUnsigned) {
			const unsignedTools: HandType[] =
				await RustManager.getSelf().get_unsigned_plugins();
			let thereIsNewPlugins = false;
			for (const tool of unsignedTools) {
				const index = parsedData.findIndex(
					(item) => item.name === tool.name,
				);
				if (index >= 0) {
					parsedData[index] = {
						...parsedData[index],
						...tool,
					};
				} else {
					const iconPath = await join(
						RealmManager.getSelf().getCurrent().location,
						"plugins",
						tool.name,
						"icon.svg",
					);
					parsedData.push({
						...tool,
						cards: [],
						icon: convertFileSrc(iconPath),
					});
					thereIsNewPlugins = true;
				}
			}
			thereIsNewPlugins && this.store.set("__root__", parsedData);
		} else {
			parsedData = parsedData.filter((i) => i.signed);
		}
		hollow.setCards(
			parsedData
				.flatMap(({ cards, name }) =>
					cards.map((c) => ({
						...c,
						data: {
							...c.data,
							tool: name,
						},
					})),
				)
				.sort(
					(p, n) =>
						new Date(p.data.CreatedDate).getTime() -
						new Date(n.data.CreatedDate).getTime(),
				),
		);

		parsedData.forEach(async (tool) => {
			const toolInstance = await this.createToolInstance(tool);
			if (toolInstance) {
				this.toolMap.set(tool.name, toolInstance);
			}
			if (!tool) return;
			toolInstance.toolEvent.on(
				"card-fs",
				({ cardName }: { cardName: string }) =>
					this.getCardFs(tool.name, cardName),
			);
			const metadata: ToolMetadata = {
				cards: tool?.cards || [],
			};
			this.updateToolMetadata(tool.name, metadata);
		});
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
		const toolClass = await RustManager.getSelf().load_plugin({
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
				RealmManager.getSelf().getCurrent().location,
				"main",
				toolName,
				"config.json",
			],
		);
		const str = await Storage.create({ path, options: { defaults: {} } });
		toolEvent.emit("config", str);
		toolEvent.on(
			"get-store",
			({ cardName, store }: { cardName: string; store: StoreType }) =>
				this.giveCardStore(toolName, cardName, store).bind(this),
		);
		return toolEvent;
	}

	private giveCardStore(
		toolName: string,
		cardName: string,
		store: StoreType,
	): () => Promise<IStore> {
		return async (): Promise<IStore> => {
			const path = await join(
				...[
					RealmManager.getSelf().getCurrent().location,
					"main",
					toolName,
					cardName,
					// TODO ../..
					store.path,
				],
			);
			return await Storage.create({ path, options: store.options });
		};
	}

	// simple internal classes organizer
	private createCoreTool(name: CoreTool, toolEvent: ToolApi): IPlugin | null {
		const toolMap: Record<
			CoreTool,
			new (app: AppApi, toolEvent: ToolApi) => IPlugin
		> = {
			// TODO
			// @ts-ignore
			image: ImageMain,
			// @ts-ignore
			notebook: NotebookMain,
			// @ts-ignore
			kanban: KanbanMain,
			// @ts-ignore
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
		const request = await RustManager.getSelf().add_plugin({
			name: name,
			repo: repo,
			isUpdate,
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

			const loadRequest = await this.loadTool(newTool);
			if (loadRequest) {
				const root: HandType[] = this.getHand();
				if (isUpdate) {
					const targetIndex = root.findIndex(
						(i) => i.name === newTool.name,
					);
					root[targetIndex] = {
						...newTool,
						icon: root[targetIndex].icon,
					};
				} else {
					root.push(newTool);
				}
				this.store.set("__root__", root);
				this.toolMap.set(newTool.name, loadRequest);
			}
			// await RustManager.getSelf().create_dir(
			// 	await join(
			// 		RealmManager.getSelf().getCurrent().location,
			// 		"main",
			// 		name,
			// 	),
			// );
		}
		return request.state;
	}

	async uninstallTool(name: string): Promise<boolean> {
		const request = await RustManager.getSelf().remove_plugin({
			name: name,
		});

		const group = hollow.cards();
		const cards = group.filter((i) => i.data.tool === name);
		if (cards) {
			cards.forEach((card) =>
				this.deleteCard(card.data.name, name, false),
			);
			let root: HandType[] = this.getHand();
			root = root.filter((i) => i.name !== name);
			this.store.set("__root__", root);
			const store = this.toolMap
				.get(name)
				.toolEvent.getData("config") as IStore;
			store.getOrigin().close();
			this.toolMap.delete(name);
			hollow.setCards(
				reconcile(group.filter((c) => c.data.tool !== name)),
			);
			await RustManager.getSelf().remove_dir(
				await join(
					...[
						RealmManager.getSelf().getCurrent().location,
						"main",
						name,
					],
				),
			);
		}

		return request;
	}

	// INTERNAL UTILS

	private updateToolMetadata(toolName: string, metadata: ToolMetadata): void {
		this.getToolEvents(toolName)?.emit("metadata", metadata);
	}

	private getCard(toolName: string, cardId: string): CardType {
		const root = this.getHand();
		return root
			.find((i) => i.name === toolName)
			.cards.find((i) => i.id === cardId);
	}

	setCard(
		toolName: string,
		cardId: string,
		updates: Record<string, any>,
		rect?: { x: number; y: number; width: number; height: number },
	) {
		const root = this.getHand();
		const tool = root.find((i) => i.name === toolName);
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

		this.store.set("__root__", root);
	}
	updateCards(cardsToUpdate: { toolName: string; cards: CardType[] }[]) {
		const root = this.getHand();

		cardsToUpdate.forEach(({ toolName, cards: newCards }) => {
			const tool = root.find((t) => t.name === toolName);
			if (!tool) return;
			tool.cards = tool.cards.map((c) => {
				const updatedCard = newCards.find((nc) => nc.id === c.id);
				return updatedCard ? updatedCard : c;
			});
		});
		this.store.set("__root__", root);
	}

	private getCardFs(toolName: string, cardName: string) {
		const cfm = CardFileManager.getSelf();
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
		cardId: string,
		toolName: string,
		fs?: boolean,
	): Promise<void> {
		const card = this.getCard(toolName, cardId);
		const toolInstance = this.toolMap.get(toolName);
		if (card.data.isPlaced) {
			const result = await toolInstance?.onUnload(cardId);
			if (!result.status) {
				console.error(result);
			}
		}
		const result = await toolInstance?.onDelete(
			this.getCard(toolName, cardId),
		);
		if (result.status) {
			const hand: HandType[] = this.getHand();
			const tool = hand.find((i) => i.name === toolName);
			tool.cards = tool.cards.filter((i) => i.id !== cardId);
			this.store.set("__root__", hand);

			hollow.setCards(
				reconcile(hollow.cards().filter((c) => c.id !== cardId)),
			);

			fs &&
				(await RustManager.getSelf().remove_dir(
					await join(
						...[
							RealmManager.getSelf().getCurrent().location,
							"main",
							toolName,
							card.data.name,
						],
					),
				));
			this.updateToolMetadata(toolName, { cards: tool.cards });
		} else {
			console.error(result);
		}
	}

	async addCard(name: string, toolName: string, emoji: string) {
		const root: HandType[] = this.getHand();
		const tool = root.find((i) => i.name === toolName);
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
			this.store.set("__root__", root);
			hollow.setCards(reconcile([...hollow.cards(), newCard]));
			// TODO : this might not be needed if creating files makes the dir anyways
			await RustManager.getSelf().create_dir(
				await join(
					RealmManager.getSelf().getCurrent().location,
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
		const toolEvent = this.getToolEvents(toolName);
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
			cards: this.getHand().find((i) => i.name === toolName).cards,
		};
		this.updateToolMetadata(toolName, metadata);
	}

	changeEmoji(emoji: string, cardId: string, toolName: string): void {
		this.setCard(toolName, cardId, { emoji: emoji });
		hollow.setCards((c) => c.id === cardId, "data", "emoji", emoji);
		const metadata: ToolMetadata = {
			cards: this.getHand().find((i) => i.name === toolName).cards,
		};
		this.updateToolMetadata(toolName, metadata);
	}

	// EXTERNAL UTILS
	getToolEvents(tool: string): ToolApi {
		return this.toolMap.get(tool).toolEvent;
	}

	public getHand(): HandType[] {
		return this.store.get("__root__");
	}
}
