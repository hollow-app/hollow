import { CardType, IPlugin, IStore, ToolApi } from "@type/hollow";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";
import { ImageType } from "./ImageType";

const Image = lazy(() => import("./Image"));

export class ImageMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();
	private toolEvents: ToolApi;
	private store: IStore = null;

	constructor(_, toolEvent: ToolApi) {
		this.toolEvents = toolEvent;
		this.store = toolEvent.getData("config");
	}

	async onCreate(card: CardType): Promise<boolean> {
		this.store.set(card.id, {
			url: "",
			caption: "",
			alt: "",
			objectFit: "contain",
			position: { x: 50, y: 50 },
		});
		return true;
	}

	async onDelete(card: CardType): Promise<boolean> {
		this.store.remove(card.id);
		return true;
	}

	async onLoad(card: CardType): Promise<boolean> {
		const targetContainer = document.getElementById(card.id);

		if (targetContainer && !this.roots.has(card.id)) {
			const data: ImageType = this.store.get(card.id);
			const dispose = createRoot((dispose) => {
				render(
					() => (
						<Image
							store={this.store}
							toolEvents={this.toolEvents}
							card={card}
							data={data}
						/>
					),
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
}
