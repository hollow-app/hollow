import {
	CardType,
	HollowEvent,
	IPlugin,
	IStore,
	PluginCapability,
	PluginResult,
	ToolApi,
	ToolEvents,
} from "@app/type/hollow";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";
import { getToolStore } from "@app/managers/Module/effects";

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
		this.capabilities = [
			{
				kind: "module",
				handler: {
					onCreate: this.onCreate.bind(this),
					onDelete: this.onDelete.bind(this),
					onLoad: this.onLoad.bind(this),
					onUnload: this.onUnload.bind(this),
				},
				meta: {
					name: "embed",
					version: "1.0.0",
					description:
						"A tool for embedding external content, including websites, videos, and widgets.",
				},
			},
		] as any;
	}

	public readonly name = "embed";
	public readonly capabilities: PluginCapability[];

	private getStore() {
		if (!this.store) {
			this.store = getToolStore("embed");
		}
		return this.store;
	}
	private async onCreate(card: CardType): Promise<PluginResult> {
		try {
			this.getStore().set(card.id, { src: "" });
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to create embed data",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	private async onDelete(card: CardType): Promise<PluginResult> {
		try {
			this.getStore().remove(card.id);
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to delete embed data",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	private async onLoad(card: CardType): Promise<PluginResult> {
		try {
			const data: EmbedData = this.getStore().get(card.id);
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
								store={this.getStore()}
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

	private async onUnload(id: string): Promise<PluginResult> {
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
