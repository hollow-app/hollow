import {
	AppEvents,
	DataBase,
	DataBaseRequest,
	HollowEvent,
	ICard,
	IPlugin,
} from "@type/hollow";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";

const Embed = lazy(() => import("./Embed"));

export type EmbedData = {
	src: string;
};

export class EmbedMain implements IPlugin {
	private db: DataBase = null;
	private roots: Map<string, () => void> = new Map();

	constructor(app: HollowEvent<AppEvents>) {
		this.getDB(app);
	}

	async onCreate(card: ICard): Promise<boolean> {
		this.db.putData("cards", card.id, { src: null });
		return true;
	}

	async onDelete(card: ICard): Promise<boolean> {
		this.db.deleteData("cards", card.id);
		return true;
	}

	async onLoad(card: ICard): Promise<boolean> {
		const data: EmbedData = await this.db.getData("cards", card.id);
		const targetContainer = document.getElementById(card.id);
		if (targetContainer && !this.roots.has(card.id)) {
			const dispose = createRoot((dispose) => {
				render(
					() => <Embed data={data} db={this.db} card={card} />,
					targetContainer,
				);
				return dispose;
			});
			this.roots.set(card.id, dispose);
		}
		return true;
	}

	onUnload(id: string): void {
		const dispose = this.roots.get(id);
		if (dispose) {
			dispose();
			this.roots.delete(id);
		}
	}

	private getDB(app: HollowEvent<AppEvents>) {
		const request: DataBaseRequest = {
			pluginName: "embedDB",
			version: 1,
			stores: [
				{
					name: "cards",
				},
			],
			callback: (db) => (this.db = db),
		};
		app.emit("database", request);
	}
}
