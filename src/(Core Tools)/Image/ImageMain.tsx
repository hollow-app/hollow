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
import { ImageType } from "./ImageType";

const Image = lazy(() => import("./Image"));

export class ImageMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();
	private db: DataBase = null;

	constructor(app: HollowEvent<AppEvents>) {
		this.getDB(app);
	}

	async onCreate(card: ICard): Promise<boolean> {
		await this.db.putData("images", card.id, {
			url: "",
			caption: "",
			alt: "",
			objectFit: "contain",
			position: { x: 50, y: 50 },
		} as ImageType);
		return true;
	}

	async onDelete(card: ICard): Promise<boolean> {
		await this.db.deleteData("images", card.id);
		return true;
	}

	async onLoad(card: ICard): Promise<boolean> {
		const targetContainer = document.getElementById(card.id);

		if (targetContainer && !this.roots.has(card.name)) {
			const data: ImageType = await this.db.getData("images", card.id);
			const dispose = createRoot((dispose) => {
				render(
					() => <Image db={this.db} card={card} data={data} />,
					targetContainer,
				);
				return dispose;
			});

			this.roots.set(card.name, dispose);
		}

		return true;
	}

	onUnload(name: string): void {
		const dispose = this.roots.get(name);
		if (dispose) {
			dispose();
			this.roots.delete(name);
		}
	}

	private getDB(app: HollowEvent<AppEvents>) {
		const request: DataBaseRequest = {
			pluginName: "imageDB",
			version: 1,
			stores: [
				{
					name: "images",
				},
			],
			callback: (db) => (this.db = db),
		};
		app.emit("database", request);
	}
}
