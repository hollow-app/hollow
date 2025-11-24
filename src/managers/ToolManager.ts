import { HandType } from "@type/HandType";
import {
	HollowEvent,
	ICard,
	IPlugin,
	CardType,
	KitType,
	ToolEvents,
	CardFs,
	IStore,
	StoreType,
	ToolEventReturns,
} from "@type/hollow";
import { Setter } from "solid-js";
import { ImageMain } from "@coretools/Image/ImageMain";
import { NotebookMain } from "@coretools/NoteBook/NotebookMain";
import { KanbanMain } from "@coretools/Kanban/KanbanMain";
import { EmbedMain } from "@coretools/Embed/EmbedMain";
import { Opthand } from "@type/Opthand";
import { EventsManager } from "./EventsManager";
import { ToolMetadata } from "@type/ToolMetadata";
import { RustManager } from "@managers/RustManager";
import { EditorKitType } from "@type/EditorKitType";
import { RealmManager } from "./RealmManager";
import { EntryManager } from "./EntryManager";
import { hollow } from "hollow";
import DEFAULT from "@assets/configs/main.json?raw";
import { join } from "@tauri-apps/api/path";
import { Storage } from "./Storage";
import { CardFileManager } from "./CardFileManager";

type ToolMethods = {
	name: string;
	onCreate(card: ICard): Promise<boolean>;
	onDelete(card: ICard): Promise<boolean>;
	onLoad(card: ICard): Promise<boolean>;
	onUnload(name: string): void;
	toolEvent: HollowEvent<ToolEvents, ToolEventReturns>;
};

type ToolMap = Map<string, ToolMethods>;
type HandMap = Map<string, HandType>;

const CORE_TOOLS = ["image", "notebook", "kanban", "embed"];
type CoreTool = (typeof CORE_TOOLS)[number];

export class ToolManager {
	private store: Storage;
	private editorKits: EditorKitType[] = [];
	private tools: ToolMethods[];
	private toolMap: ToolMap;
	private handMap: HandMap;
	public setHand: Setter<Opthand[]>;
	private toolsEvent: { [toolName: string]: HollowEvent } = {};

	// INITIALIZATION
	private constructor() {
		this.toolMap = new Map();
		this.handMap = new Map();
	}

	static async create(loadUnsigned?: boolean): Promise<ToolManager> {
		const instance = new ToolManager();
		await instance.start(loadUnsigned);
		return instance;
	}

	private async initializeTools(loadUnsigned?: boolean): Promise<void> {
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

		parsedData.forEach((tool) => this.handMap.set(tool.name, tool));

		this.tools = await Promise.all(
			parsedData.map(async (tool) => {
				const toolInstance = await this.createToolInstance(tool);
				if (toolInstance) {
					this.toolMap.set(tool.name, toolInstance);
				}
				//
				// await RustManager.getSelf().create_dir(
				// 	await join(
				// 		RealmManager.getSelf().getCurrent().location,
				// 		"main",
				// 		tool.name,
				// 	),
				// );
				//
				return toolInstance;
			}),
		);

		this.tools.forEach((tool) => {
			if (!tool) return;
			const metadata: ToolMetadata = {
				cards: this.handMap.get(tool.name)?.cards || [],
			};
			this.toolsEvent[tool.name] = tool.toolEvent;
			this.updateToolMetadata(tool.name, metadata);
		});
	}

	async start(loadUnsigned?: boolean): Promise<void> {
		await this.initializeTools(loadUnsigned);
	}
	// loads internal tools classes
	private async createToolInstance(
		tool: HandType,
	): Promise<ToolMethods | null> {
		if (CORE_TOOLS.includes(tool.name as CoreTool)) {
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
	private async createToolEvent(
		toolName: string,
	): Promise<HollowEvent<ToolEvents, ToolEventReturns>> {
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
		toolEvent.on("add-card-fs", this.registerCardFs);
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

	private registerCardFs(props: {
		toolEvent: HollowEvent<ToolEvents>;
		cardName: string;
		fs: CardFs;
	}) {
		const group = props.toolEvent.getCurrentData("cards-fs");
		if (!group) {
			props.toolEvent.emit("cards-fs", { [props.cardName]: props.fs });
		} else {
			props.toolEvent.emit("cards-fs", {
				...group,
				[props.cardName]: props.fs,
			});
		}
	}

	// simple internal classes organizer
	private createCoreTool(
		name: CoreTool,
		toolEvent: HollowEvent<ToolEvents, ToolEventReturns>,
	): IPlugin | null {
		const toolMap: Record<
			CoreTool,
			new (
				toolEvent: HollowEvent<ToolEvents, ToolEventReturns>,
			) => IPlugin
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
		return new toolMap[name](toolEvent);
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
				this.handMap.set(newTool.name, newTool);
				this.toolMap.set(newTool.name, loadRequest);
				// TODO ??
				// this.setHand((prev) => [
				// 	...prev,
				// 	{
				// 		tool: newTool.name,
				// 		card: "",
				// 		isPlaced: false,
				// 		kit: {
				// 			width: 2,
				// 			height: 2,
				// 			corner: 10,
				// 			opacity: 1,
				// 			border: {
				// 				c: "#3d3d3d",
				// 				n: 2,
				// 			},
				// 			glass: false,
				// 			shadow: false,
				// 			xyz: {
				// 				x: 0,
				// 				y: 0,
				// 				z: 0,
				// 			},
				// 		},
				// 	},
				// ]);
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

		const tool = this.handMap.get(name);
		if (tool) {
			await Promise.all(
				tool.cards.map((card) =>
					this.deleteCard(card.name, name, false),
				),
			);

			let root: HandType[] = this.getHand();
			root = root.filter((i) => i.name !== title.toLowerCase());
			this.store.set("__root__", root);
			this.handMap.delete(name);
			this.toolMap.delete(name);
			this.tools = this.tools.filter((i) => i.name !== name);
			delete this.toolsEvent[name];
			this.setHand((prev) => prev.filter((i) => i.tool !== name));
			await RustManager.getSelf().remove_dir(
				await join(
					...[
						RealmManager.getSelf().getCurrent().location,
						"main",
						tool.name,
					],
				),
			);
		}

		return request;
	}

	// INTERNAL UTILS
	private getICard(toolName: string, cardId: string) {
		const methods = this.toolMap.get(toolName);
		const card = this.getCard(toolName, cardId);
		const happ = hollow.events;
		const cardobj: ICard = {
			...card,
			app: {
				on: happ.on.bind(happ),
				off: happ.off.bind(happ),
				emit: happ.emit.bind(happ),
				clear: happ.clear.bind(happ),
				toggle: happ.toggle.bind(happ),
				getCurrentData: happ.getCurrentData.bind(happ),
			},
			toolEvent: methods.toolEvent,
		};
		return cardobj;
	}

	private updateToolMetadata(toolName: string, metadata: ToolMetadata): void {
		this.toolMap.get(toolName)?.toolEvent.emit("metadata", metadata);
	}

	private getCard(toolName: string, cardId: string): CardType {
		const root = this.getHand();
		return root
			.find((i) => i.name === toolName)
			.cards.find((i) => i.id === cardId);
	}

	private setCard(toolName: string, cardId: string, key: string, value: any) {
		// console.log("changing card's ", key, " to ", value);
		const root = this.getHand();
		const tool = root.find((i) => i.name === toolName);
		tool.cards = tool.cards.map((i) =>
			i.id === cardId ? { ...i, [key]: value } : i,
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
		const toolEvent = this.toolsEvent[toolName];
		toolEvent.emit("add-card-fs", {
			toolEvent,
			cardName: cardInfo.name,
			fs: this.getCardFs(toolName, cardInfo.name),
		});
		return await tool.onLoad(this.getICard(toolName, cardInfo.id));
	}

	async deleteCard(
		cardId: string,
		toolName: string,
		fs?: boolean,
	): Promise<void> {
		const card = this.getCard(toolName, cardId);
		const toolInstance = this.toolMap.get(toolName);
		if (card.isPlaced) {
			toolInstance?.onUnload(cardId);
		}
		await toolInstance?.onDelete(this.getICard(toolName, cardId));

		const hand: HandType[] = this.getHand();
		const tool = hand.find((i) => i.name === toolName);
		tool.cards = tool.cards.filter((i) => i.id !== cardId);
		this.store.set("__root__", hand);

		this.setHand((prev) =>
			prev.filter((i) => !(i.id === cardId && i.tool === toolName)),
		);

		const entries = EntryManager.getSelf().entries.filter(
			(e) => e.source.card === card.name,
		);
		EntryManager.getSelf().removeEntry(entries.map((i) => i.id));
		fs &&
			(await RustManager.getSelf().remove_dir(
				await join(
					...[
						RealmManager.getSelf().getCurrent().location,
						"main",
						toolName,
						card.name,
					],
				),
			));
		this.updateToolMetadata(toolName, { cards: tool.cards });
	}

	async addCard(name: string, toolName: string, emoji: string) {
		const root: HandType[] = this.getHand();
		const tool = root.find((i) => i.name === toolName);
		if (tool.cards.some((i) => i.name === name)) {
			hollow.events.emit("alert", {
				type: "error",
				message: "A card with that name already exists",
			});
			return;
		}
		const id = crypto.randomUUID();
		const newCard: CardType = {
			id,
			name,
			emoji: emoji,
			isPlaced: false,
			isFavored: false,
			CreatedDate: new Date().toISOString(),
			kit: {
				width: 2,
				height: 2,
				corner: 10,
				opacity: 1,
				border: { c: "#3d3d3d", n: 2 },
				glass: false,
				shadow: false,
				xyz: { x: 0, y: 0, z: 0 },
				extra: {
					padding: "calc(var(--spacing) * 4)",
					outerMargin: "calc(var(--spacing) * 4)",
					background:
						"color-mix(in oklab, var(--color-secondary) var(--opacity), transparent)",
				},
			},
		};

		tool.cards = [...tool.cards, newCard];
		this.toolMap.get(toolName)?.onCreate(this.getICard(toolName, id));

		this.store.set("__root__", root);
		const newOptCard: Opthand = {
			...newCard,
			tool: toolName,
		};
		// TODO : this might not be needed if creating files makes the dir anyways
		// await RustManager.getSelf().create_dir(
		// 	await join(
		// 		RealmManager.getSelf().getCurrent().location,
		// 		"main",
		// 		tool.name,
		// 		newCard.name,
		// 	),
		// );

		this.setHand((prev) => [...prev, newOptCard]);
	}

	// CARD MANIPULATION
	togglePlacement(id: string, toolName: string) {
		const card = this.getCard(toolName, id);
		const toolEvent = this.toolsEvent[toolName];
		if (card.isPlaced) {
			this.unPlaceCard(toolName, id);
			const group = toolEvent.getCurrentData("cards-fs");
			if (group) {
				delete group[card.name];
				toolEvent.emit("cards-fs", group);
			}
		} else {
			this.placeCard(toolName, id);
		}
		this.setCard(toolName, id, "isPlaced", !card.isPlaced);
		const metadata: ToolMetadata = {
			cards: this.getHand().find((i) => i.name === toolName).cards,
		};
		this.updateToolMetadata(toolName, metadata);
	}

	private placeCard(toolName: string, cardId: string): void {
		this.setHand((prev) => {
			const nList = [...prev];
			const target = nList.find(
				(i) => i.tool === toolName && i.id === cardId,
			);
			if (target) target.isPlaced = true;
			return nList;
		});
	}

	private unPlaceCard(toolName: string, cardId: string): void {
		const toolInstance = this.toolMap.get(toolName);
		toolInstance?.onUnload(cardId);

		this.setHand((prev) => {
			const nList = [...prev];
			const target = nList.find(
				(i) => i.tool === toolName && i.id === cardId,
			);
			if (target) target.isPlaced = false;
			return nList;
		});
	}

	changeEmoji(emoji: string, cardId: string, toolName: string): void {
		this.setCard(toolName, cardId, "emoji", emoji);
	}

	changeKit(kit: KitType, cardId: string, tool: string): void {
		this.setCard(tool, cardId, "kit", kit);
		// TODO editorKits???
		const target = this.editorKits.find(
			(i) =>
				i.tool === tool && i.card === this.getCard(tool, cardId).name,
		);
		if (target) {
			target.it = kit;
		}
	}

	// EXTERNAL UTILS
	getToolEvents(tool: string) {
		return this.toolsEvent[tool];
	}
	optimizeHand(): Opthand[] {
		return this.getHand().flatMap(({ name, cards }) =>
			cards.map((i) => ({
				tool: name,
				...i,
			})),
		);
	}
	public getEditorKit(toolName: string, cardName: string) {
		return this.editorKits.find(
			(i) => i.tool === toolName && i.card === cardName,
		);
	}
	public addEditorKit(kit: EditorKitType) {
		this.editorKits.push(kit);
	}

	public getHand(): HandType[] {
		return this.store.get("__root__");
	}
}
