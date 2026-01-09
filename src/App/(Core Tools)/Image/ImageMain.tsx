import { CardType, IPlugin, IStore, PluginResult, ToolApi } from "@type/hollow";
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

	public async onCreate(card: CardType): Promise<PluginResult> {
		try {
			this.store.set(card.id, {
				url: "",
				caption: "",
				alt: "",
				objectFit: "contain",
				position: { x: 50, y: 50 },
			});
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to create image data",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	public async onDelete(card: CardType): Promise<PluginResult> {
		try {
			this.store.remove(card.id);
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to delete image data",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	public async onLoad(card: CardType): Promise<PluginResult> {
		try {
			const targetContainer = document.getElementById(card.id);
			if (!targetContainer) {
				return {
					status: false,
					message: `DOM container not found for card id: ${card.id}`,
				};
			}

			if (!this.roots.has(card.id)) {
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

			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to load image UI",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	public async onUnload(id: string): Promise<PluginResult> {
		try {
			const dispose = this.roots.get(id);
			if (dispose) {
				dispose();
				this.roots.delete(id);
			}
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to unload image resources",
				error: error instanceof Error ? error : undefined,
			};
		}
	}
}
