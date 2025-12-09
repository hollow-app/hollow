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
	AppEvents,
	AppEventReturns,
	ToolApi,
	AppApi,
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

type ToolMethods = {
	name: string;
	onCreate(card: CardType): Promise<boolean>;
	onDelete(card: CardType): Promise<boolean>;
	onLoad(card: CardType): Promise<boolean>;
	onUnload(name: string): void;
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
			const unsignedTools = (
				await RustManager.getSelf().get_unsigned_plugins()
			).filter((i) => !parsedData.find((j) => j.name === i.name));
			parsedData.push(...unsignedTools);
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
							extra: { ...c.data.extra, tool: name },
						},
					})),
				)
				.sort(
					(p, n) =>
						new Date(p.data.extra.CreatedDate).getTime() -
						new Date(n.data.extra.CreatedDate).getTime(),
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
		const fullPath = await join(...["plugins", tool.name, "index.js"]);

		const toolEvent = await this.createToolEvent(tool.name);
		const toolClass = await RustManager.getSelf().load_plugin({
			fullPath: fullPath,
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
				this.giveCardStore(toolName, cardName, store),
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
	async installTool(name: string, repo: string): Promise<boolean> {
		const request = await RustManager.getSelf().add_plugin({
			name: name,
			repo: repo,
		});
		if (request.state) {
			const manifest = JSON.parse(request.manifest);
			const newTool: HandType = {
				...manifest,
				icon: request.icon,
				name: manifest.name.toLowerCase(),
				title: manifest.name,
				cards: [],
				signed: true,
			};

			const loadRequest = await this.loadTool(newTool);
			if (loadRequest) {
				const root: HandType[] = this.getHand();
				root.push(newTool);
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

	async uninstallTool(title: string): Promise<boolean> {
		const name = title.toLowerCase();
		const request = await RustManager.getSelf().remove_plugin({
			name: title,
		});

		const group = hollow.cards();
		const cards = group.filter((i) => i.data.extra.tool === name);
		if (cards) {
			cards.forEach((card) =>
				this.deleteCard(card.data.extra.name, name, false),
			);
			let root: HandType[] = this.getHand();
			root = root.filter((i) => i.name !== title.toLowerCase());
			this.store.set("__root__", root);
			this.toolMap.delete(name);
			hollow.setCards(
				reconcile(group.filter((c) => c.data.extra.name !== name)),
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

	setCard(toolName: string, cardId: string, updates: Record<string, any>) {
		const root = this.getHand();
		const tool = root.find((i) => i.name === toolName);
		if (!tool) return;

		tool.cards = tool.cards.map((card) =>
			card.id === cardId
				? {
						...card,
						data: {
							...card.data,
							extra: { ...card.data.extra, ...updates },
						},
					}
				: card,
		);

		this.store.set("__root__", root);
	}
	updateCard(toolName: string, newCard: CardType) {
		const root = this.getHand();
		const tool = root.find((i) => i.name === toolName);
		if (!tool) return;
		tool.cards = tool.cards.map((card) =>
			card.id === newCard.id ? newCard : card,
		);
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
	async loadCard(cardInfo: CardType, toolName: string): Promise<boolean> {
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
		if (card.data.extra.isPlaced) {
			toolInstance?.onUnload(cardId);
		}
		await toolInstance?.onDelete(this.getCard(toolName, cardId));

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
						card.data.extra.name,
					],
				),
			));
		this.updateToolMetadata(toolName, { cards: tool.cards });
	}

	async addCard(name: string, toolName: string, emoji: string) {
		const root: HandType[] = this.getHand();
		const tool = root.find((i) => i.name === toolName);
		if (tool.cards.some((i) => i.data.extra.name === name)) {
			hollow.events.emit("alert", {
				type: "error",
				message: "A card with that name already exists",
			});
			return;
		}
		const id = "node-" + crypto.randomUUID();
		const newCard: CardType = {
			id,
			width: 300,
			height: 300,
			x: 10,
			y: 10,
			style: {
				"border-radius": "10",
				"--opacity": "100%",
				"outline-color": "#3d3d3d",
				"outline-width": "2",
				background:
					"color-mix(in oklab, var(--color-secondary) var(--opacity), transparent)",
			},
			data: {
				component: "default",
				extra: {
					name,
					emoji: emoji,
					isPlaced: false,
					isFavored: false,
					CreatedDate: new Date().toISOString(),
				},
			},
		};

		tool.cards = [...tool.cards, newCard];
		this.toolMap.get(toolName)?.onCreate(this.getCard(toolName, id));

		this.store.set("__root__", root);
		const newNode: CardType = newCard;
		newNode.data.extra.tool = toolName;
		hollow.setCards(reconcile([...hollow.cards(), newNode]));
		// TODO : this might not be needed if creating files makes the dir anyways
		await RustManager.getSelf().create_dir(
			await join(
				RealmManager.getSelf().getCurrent().location,
				"main",
				tool.name,
				newCard.data.extra.name,
			),
		);
	}

	// CARD MANIPULATION
	togglePlacement(id: string, toolName: string) {
		const toolEvent = this.getToolEvents(toolName);
		const card: CardType = hollow.cards().find((c) => c.id === id);
		if (card.data.extra.isPlaced) {
			const toolInstance = this.toolMap.get(toolName);
			toolInstance?.onUnload(id);
		}
		this.setCard(toolName, id, { isPlaced: !card.data.extra.isPlaced });
		hollow.setCards(
			(c) => c.id === id,
			"data",
			"extra",
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
		hollow.setCards(
			(c) => c.id === cardId,
			"data",
			"extra",
			"emoji",
			emoji,
		);
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
