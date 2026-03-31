import {
	CardType,
	IStore,
	ModuleCapability,
	PluginResult,
	rawPluginCapability,
	ToolApi,
} from "@app/type/hollow";
import { sendIframeRequest } from "@app/utils";
import { createRoot } from "solid-js";
import { render } from "solid-js/web";
import { buildPluginIframe } from ".";
import { getToolStore } from "@app/managers/Module/effects";

export class ModuleMain implements ModuleCapability {
	private roots = new Map<string, () => void>();
	private store: IStore;
	private capability: rawPluginCapability;
	private iframe: HTMLIFrameElement;
	private instances: Record<
		string,
		{ iframe: HTMLIFrameElement; cleanup: () => void }
	> = {};
	private toolEvent: ToolApi;

	constructor(
		iframe: HTMLIFrameElement,
		capability: rawPluginCapability,
		toolEvents: ToolApi,
	) {
		this.iframe = iframe;
		this.capability = capability;
		this.toolEvent = toolEvents;
		this.toolEvent.on("store:save", (payload: any) => {
			if (payload) {
				const { id, data } = payload;
				if (id && data) {
					this.getStore().set(id, data);
				}
			}
		});
	}

	async onCreate(card: CardType) {
		const result = await sendIframeRequest(this.iframe, "module:create", {
			card,
		});
		if (result) {
			this.getStore().set(card.id, result["data"]);
		}
		return { status: true };
	}

	async onDelete(card: CardType) {
		this.getStore().remove(card.id);
		return { status: true };
	}

	async onLoad(card: CardType) {
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
		const data: any = this.getStore().get(card.id);
		const code = this.capability.handler;
		const instanceIframe = buildPluginIframe({
			module: this.toolEvent,
			script: code,
			additionalData: [
				["DATA", data],
				["INSTANCE", card],
				["TYPE", "ui"],
			],
		});
		const dispose = createRoot((dispose) => {
			render(
				() => (
					<div
						class="size-full"
						ref={(container) =>
							container.appendChild(instanceIframe.iframe)
						}
					/>
				),
				container,
			);
			return dispose;
		});
		this.instances[card.id] = instanceIframe;
		this.roots.set(card.id, dispose);
		return { status: true };
	}
	async onUnload(id: string): Promise<PluginResult> {
		try {
			const dispose = this.roots.get(id);
			const builtIframe = this.instances[id];
			if (dispose) {
				builtIframe.cleanup();
				dispose();
				this.roots.delete(id);
			}
			return { status: true };
		} catch (error) {
			return this.failure("Failed to unload image resources", error);
		}
	}

	private getStore() {
		if (!this.store) {
			this.store = getToolStore(this.capability.meta.name);
		}
		return this.store;
	}
	private failure(message: string, error: unknown): PluginResult {
		return {
			status: false,
			message,
			error: error instanceof Error ? error : undefined,
		};
	}
}
