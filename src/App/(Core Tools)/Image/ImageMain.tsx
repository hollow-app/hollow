import {
	CardType,
	IPlugin,
	IStore,
	PluginCapability,
	PluginResult,
	ToolApi,
} from "@app/type/hollow";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";
import { ImageType } from "./ImageType";
import { getToolStore } from "@app/managers/Module/effects";

const Image = lazy(() => import("./Image"));

export class ImageMain implements IPlugin {
	private roots = new Map<string, () => void>();
	private readonly toolEvents: ToolApi;
	private store: IStore;

	public readonly name: string = "image";
	public readonly capabilities: PluginCapability[];

	constructor(_: unknown, toolEvent: ToolApi) {
		this.toolEvents = toolEvent;

		this.capabilities = [
			{
				meta: {
					name: "image",
					version: "1.0.0",
					description:
						"An image management tool for viewing, organizing, and editing pictures.",
				},
				kind: "module",
				handler: {
					onCreate: this.onCreate.bind(this),
					onDelete: this.onDelete.bind(this),
					onLoad: this.onLoad.bind(this),
					onUnload: this.onUnload.bind(this),
				},
			},
		];
	}

	private getStore() {
		if (!this.store) {
			this.store = getToolStore("image");
		}
		return this.store;
	}
	// ---------------------------
	// Module
	// ---------------------------

	private async onCreate(card: CardType): Promise<PluginResult> {
		try {
			this.getStore().set(card.id, {
				url: "",
				caption: "",
				alt: "",
				objectFit: "contain",
				position: { x: 50, y: 50 },
			});

			return { status: true };
		} catch (error) {
			return this.failure("Failed to create image data", error);
		}
	}

	private async onDelete(card: CardType): Promise<PluginResult> {
		try {
			this.getStore().remove(card.id);
			return { status: true };
		} catch (error) {
			return this.failure("Failed to delete image data", error);
		}
	}

	private async onLoad(card: CardType): Promise<PluginResult> {
		try {
			const container = document.getElementById(card.id);
			if (!container) {
				return {
					status: false,
					message: `DOM container not found for card id: ${card.id}`,
				};
			}
			if (this.roots.has(card.id)) {
				return { status: true };
			}
			const data: ImageType = this.getStore().get(card.id);
			const dispose = createRoot((dispose) => {
				render(
					() => (
						<Image
							store={this.getStore()}
							toolEvents={this.toolEvents}
							card={card}
							data={data}
						/>
					),
					container,
				);
				return dispose;
			});

			this.roots.set(card.id, dispose);

			return { status: true };
		} catch (error) {
			return this.failure("Failed to load image UI", error);
		}
	}

	private async onUnload(id: string): Promise<PluginResult> {
		try {
			const dispose = this.roots.get(id);

			if (dispose) {
				dispose();
				this.roots.delete(id);
			}

			return { status: true };
		} catch (error) {
			return this.failure("Failed to unload image resources", error);
		}
	}

	private failure(message: string, error: unknown): PluginResult {
		return {
			status: false,
			message,
			error: error instanceof Error ? error : undefined,
		};
	}
}
