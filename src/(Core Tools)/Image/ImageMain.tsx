import { DataBase, HollowEvent, ICard, IPlugin } from "hollow-api";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";

const Image = lazy(() => import("./Image"));

export type ImageData = {
	url: string;
	caption?: string;
	alt?: string;
	objectFit: "contain" | "cover" | "fill" | "none" | "scale-down";
	position?: {
		x: number;
		y: number;
	};
};

export class ImageMain implements IPlugin {
	private db: DataBase = null;
	private roots: Map<string, () => void> = new Map();

	constructor(db?: DataBase) {
		this.db = db;
	}

	async onCreate(name: string): Promise<boolean> {
		this.db.putData(name, {
			url: "",
			caption: "",
			alt: "",
			objectFit: "contain",
			position: { x: 50, y: 50 },
		});
		return true;
	}

	async onDelete(name: string): Promise<boolean> {
		this.db.deleteData(name);
		return true;
	}

	async onLoad(card: ICard, app?: HollowEvent): Promise<boolean> {
		const targetContainer = document.getElementById(card.containerID);
		const data: ImageData = (await this.db.getData(card.name)) ?? {
			url: "",
			caption: "",
			alt: "",
			objectFit: "contain",
			position: { x: 50, y: 50 },
		};

		if (targetContainer && !this.roots.has(card.name)) {
			const dispose = createRoot((dispose) => {
				render(
					() => (
						<Image card={card} app={app} data={data} db={this.db} />
					),
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
}
