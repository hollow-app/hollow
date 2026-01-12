import {
	CardType,
	HollowEvent,
	IPlugin,
	IStore,
	PluginResult,
	ToolApi,
	ToolEvents,
} from "@type/hollow";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";

const Embed = lazy(() => import("./Embed"));

export type EmbedData = {
	src: string;
};

export class EmbedMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();
	private toolEvents: ToolApi;
	private store: IStore = null;

	constructor(_, toolEvent: HollowEvent<ToolEvents>) {
		this.toolEvents = toolEvent;
		this.store = toolEvent.getData("config");
	}

	public async onCreate(card: CardType): Promise<PluginResult> {
		try {
			this.store.set(card.id, { src: "" });
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to create embed data",
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
				message: "Failed to delete embed data",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	public async onLoad(card: CardType): Promise<PluginResult> {
		try {
			const data: EmbedData = this.store.get(card.id);
			const targetContainer = document.getElementById(card.id);
			if (!targetContainer) {
				return {
					status: false,
					message: `DOM container not found for card id: ${card.id}`,
				};
			}

			if (!this.roots.has(card.id)) {
				const dispose = createRoot((dispose) => {
					render(
						() => (
							<Embed
								data={data}
								store={this.store}
								card={card}
								toolEvents={this.toolEvents}
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
				message: "Failed to load embed UI",
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
				message: "Failed to unload embed resources",
				error: error instanceof Error ? error : undefined,
			};
		}
	}
}
