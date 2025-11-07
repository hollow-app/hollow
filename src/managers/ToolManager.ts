import { HandType } from "@type/HandType";
import {
	HollowEvent,
	ICard,
	IPlugin,
	CardType,
	KitType,
	ToolEvents,
	AppEvents,
} from "@type/hollow";
import { Setter } from "solid-js";
import { ImageMain } from "@coretools/Image/ImageMain";
import { NotebookMain } from "@coretools/NoteBook/NotebookMain";
import { KanbanMain } from "@coretools/Kanban/KanbanMain";
import { EmbedMain } from "@coretools/Embed/EmbedMain";
import { Opthand } from "@type/Opthand";
import { ToolDataBase } from "./ToolDataBase";
import { EventsManager } from "./EventsManager";
import { ToolMetadata } from "@type/ToolMetadata";
import { RustManager } from "@managers/RustManager";
import { EditorKitType } from "@type/EditorKitType";
import { RealmManager } from "./RealmManager";
import { EntryManager } from "./EntryManager";
import { hollow } from "hollow";
import DEFAULT from "@assets/configs/tools.json?raw";

type ToolMethods = {
	name: string;
	onCreate(card: ICard): Promise<boolean>;
	onDelete(card: ICard): Promise<boolean>;
	onLoad(card: ICard): Promise<boolean>;
	onUnload(name: string): void;
	toolEvent: HollowEvent<ToolEvents>;
};

type ToolMap = Map<string, ToolMethods>;
type HandMap = Map<string, HandType>;

const CORE_TOOLS = ["image", "notebook", "kanban", "embed"];
type CoreTool = (typeof CORE_TOOLS)[number];

export class ToolManager {
	private hand: HandType[];
	private editorKits: EditorKitType[] = [];
	private tools: ToolMethods[];
	private toolMap: ToolMap;
	private handMap: HandMap;
	public setHand: Setter<Opthand[]>;
	public toolsEvent: { [toolName: string]: HollowEvent } = {};
	private realm = RealmManager.getSelf().currentRealmId;

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
		let realmTools = localStorage.getItem(`${this.realm}-tools`) ?? DEFAULT;
		let parsedData: HandType[] = JSON.parse(realmTools);
		//const hasUnsigned = parsedData.some((i) => !i.signed);

		if (loadUnsigned) {
			const unsignedTools = (
				await RustManager.getSelf().get_unsigned_tools()
			).filter((i) => !parsedData.find((j) => j.name === i.name));
			parsedData.push(...unsignedTools);
		} else {
			parsedData = parsedData.filter((i) => i.signed);
			localStorage.setItem(
				`${this.realm}-tools`,
				JSON.stringify(parsedData),
			);
		}

		this.hand = parsedData;
		this.hand.forEach((tool) => this.handMap.set(tool.name, tool));

		this.tools = await Promise.all(
			this.hand.map(async (tool) => {
				const toolInstance = await this.createToolInstance(tool);
				if (toolInstance) {
					this.toolMap.set(tool.name, toolInstance);
				}
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

	private async createToolInstance(
		tool: HandType,
	): Promise<ToolMethods | null> {
		if (CORE_TOOLS.includes(tool.name as CoreTool)) {
			const toolClass = this.createCoreTool(tool.name as CoreTool);
			if (!toolClass) return null;

			return {
				name: tool.name,
				onCreate: toolClass.onCreate.bind(toolClass),
				onDelete: toolClass.onDelete.bind(toolClass),
				onLoad: toolClass.onLoad.bind(toolClass),
				onUnload: toolClass.onUnload.bind(toolClass),
				toolEvent: new EventsManager() as HollowEvent<ToolEvents>,
			};
		}
		return this.loadTool(tool);
	}

	private createCoreTool(name: CoreTool): IPlugin | null {
		const toolMap: Record<
			CoreTool,
			new (app: HollowEvent<AppEvents>) => IPlugin
		> = {
			image: ImageMain,
			notebook: NotebookMain,
			kanban: KanbanMain,
			embed: EmbedMain,
		};
		return new toolMap[name](hollow.events);
	}

	async start(loadUnsigned?: boolean): Promise<void> {
		await this.initializeTools(loadUnsigned);
	}

	async installTool(name: string, repo: string): Promise<boolean> {
		const request = await RustManager.getSelf().install_plugin({
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
				this.hand.push(newTool);
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
				this.update();
			}
		}
		return request.state;
	}

	async uninstallTool(title: string): Promise<boolean> {
		const name = title.toLowerCase();
		const usedByOtherRealms = this.isToolUsedByOtherRealms(name);
		const request = usedByOtherRealms
			? { state: true }
			: await RustManager.getSelf().uninstall_plugin({
					name: title,
				});

		const tool = this.handMap.get(name);
		if (tool) {
			await Promise.all(
				tool.cards.map((card) => this.deleteCard(card.name, name)),
			);

			this.hand = this.hand.filter((i) => i.name !== name);
			this.handMap.delete(name);
			this.toolMap.delete(name);
			this.setHand((prev) => prev.filter((i) => i.tool !== name));
			this.update();
		}

		return request;
	}

	private isToolUsedByOtherRealms(name: string): boolean {
		return (
			RealmManager.getSelf()
				.realms.map(
					(r) =>
						JSON.parse(
							localStorage.getItem(`${r.id}-tools`) || "[]",
						) as HandType[],
				)
				.reduce(
					(acc, tools) =>
						acc + (tools.some((t) => t.name === name) ? 1 : 0),
					0,
				) > 1
		);
	}

	async loadTool(tool: HandType): Promise<ToolMethods | null> {
		const fullPath = await RustManager.getSelf().join({
			path: ["user_plugins", tool.title!, "index.js"],
		});

		const db = new ToolDataBase(tool.name, tool.dbVersion);
		const toolClass = await RustManager.getSelf().load_plugin({
			fullPath: fullPath,
			db: {
				putData: db.putData.bind(db),
				getData: db.getData.bind(db),
				deleteData: db.deleteData.bind(db),
				getAllData: db.getAllData.bind(db),
				clearStore: db.clearStore.bind(db),
				getDBInstance: db.getDBInstance.bind(db),
				deleteDatabase: db.deleteDatabase.bind(db),
			},
		});

		if (!toolClass) return null;

		return {
			name: tool.name,
			onCreate: toolClass.onCreate.bind(toolClass),
			onDelete: toolClass.onDelete.bind(toolClass),
			onLoad: toolClass.onLoad.bind(toolClass),
			onUnload: toolClass.onUnload.bind(toolClass),
			toolEvent: new EventsManager() as HollowEvent<ToolEvents>,
		};
	}

	optimizeHand(): Opthand[] {
		return this.hand.flatMap(({ name, cards }) =>
			cards.map((i) => ({
				tool: name,
				...i,
			})),
		);
	}
	private getICard(toolName: string, cardName: string) {
		const methods = this.toolMap.get(toolName);
		const card = this.hand
			.find((i) => i.name === toolName)
			.cards.find((i) => i.name === cardName);
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
	async loadCard(cardInfo: CardType, toolName: string): Promise<void> {
		const tool = this.toolMap.get(toolName);
		tool.onLoad(this.getICard(toolName, cardInfo.name));
	}
	togglePlacement(name: string, toolName: string) {
		const { tool, card } = this.getToolAndCard(toolName, name);
		if (!tool || !card) {
			return;
		}
		if (card.isPlaced) {
			this.unPlaceCard(tool, card);
		} else {
			this.placeCard(tool, card);
		}
		const metadata: ToolMetadata = {
			cards: this.hand.find((i) => i.name === toolName).cards,
		};
		this.updateToolMetadata(toolName, metadata);
	}

	private placeCard(tool: HandType, card: CardType): void {
		this.setHand((prev) => {
			const nList = [...prev];
			const target = nList.find(
				(i) => i.tool === tool.name && i.name === card.name,
			);
			if (target) target.isPlaced = true;
			return nList;
		});
		card.isPlaced = true;
		this.update();
	}

	private unPlaceCard(tool: HandType, card: CardType): void {
		const toolInstance = this.toolMap.get(tool.name);
		toolInstance?.onUnload(card.name);

		this.setHand((prev) => {
			const nList = [...prev];
			const target = nList.find(
				(i) => i.tool === tool.name && i.name === card.name,
			);
			if (target) target.isPlaced = false;
			return nList;
		});

		card.isPlaced = false;
		this.update();
	}

	async deleteCard(name: string, toolName: string): Promise<void> {
		const { tool, card } = this.getToolAndCard(toolName, name);
		if (!tool || !card) return;

		const toolInstance = this.toolMap.get(toolName);
		if (card.isPlaced) {
			toolInstance?.onUnload(name);
		}

		await toolInstance?.onDelete(this.getICard(toolName, name));
		tool.cards = tool.cards.filter((i) => i.name !== name);

		this.setHand((prev) =>
			prev.filter((i) => !(i.name === name && i.tool === toolName)),
		);

		const entries = EntryManager.getSelf().entries.filter(
			(e) => e.source.card === name,
		);
		EntryManager.getSelf().removeEntry(entries.map((i) => i.id));

		this.update();
		this.updateToolMetadata(toolName, { cards: tool.cards });
	}

	changeEmoji(emoji: string, cardName: string, toolName: string): void {
		const { tool, card } = this.getToolAndCard(toolName, cardName);
		if (tool && card) {
			card.emoji = emoji;
			this.update();
		}
	}

	addCard(name: string, toolName: string, emoji: string): void {
		const { tool } = this.getToolAndCard(toolName);
		if (!tool) return;

		const newCard: CardType = {
			id: crypto.randomUUID(),
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
		this.toolMap.get(toolName)?.onCreate(this.getICard(toolName, name));

		const newOptCard: Opthand = {
			...newCard,
			tool: toolName,
		};

		this.setHand((prev) => [...prev, newOptCard]);
		this.update();
	}

	changeKit(kit: KitType, card: string, tool: string): void {
		const handTool = this.handMap.get(tool);
		const targetCard = handTool?.cards.find((i) => i.name === card);
		if (targetCard) {
			targetCard.kit = kit;
			this.update();
		}
		const target = this.editorKits.find(
			(i) => i.tool === tool && i.card === card,
		);
		if (target) {
			target.it = kit;
		}
	}

	private updateToolMetadata(toolName: string, metadata: ToolMetadata): void {
		this.toolMap.get(toolName)?.toolEvent.emit("metadata", metadata);
	}

	private getToolAndCard(
		toolName: string,
		cardName?: string,
	): { tool: HandType | undefined; card: CardType | undefined } {
		const tool = this.handMap.get(toolName);
		const card = cardName
			? tool?.cards.find((card) => card.name === cardName)
			: undefined;
		return { tool, card };
	}

	public getEditorKit(toolName: string, cardName: string) {
		return this.editorKits.find(
			(i) => i.tool === toolName && i.card === cardName,
		);
	}
	public addEditorKit(kit: EditorKitType) {
		this.editorKits.push(kit);
	}

	public getHand() {
		return this.hand;
	}

	private update() {
		localStorage.setItem(`${this.realm}-tools`, JSON.stringify(this.hand));
	}
}
