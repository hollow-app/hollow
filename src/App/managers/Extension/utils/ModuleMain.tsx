import {
	AppApi,
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

export class ModuleMain implements ModuleCapability {
	private roots = new Map<string, () => void>();
	private readonly store: IStore;
	private capability: rawPluginCapability;
	private iframe: HTMLIFrameElement;
	private instances: Record<string, HTMLIFrameElement> = {};
	private toolEvent: ToolApi;

	constructor(
		iframe: HTMLIFrameElement,
		capability: rawPluginCapability,
		appApi: AppApi,
		toolEvent: ToolApi,
	) {
		this.iframe = iframe;
		this.store = toolEvent.getData("config");
		this.capability = capability;
		this.toolEvent = toolEvent;
	}

	async onCreate(card: CardType) {
		const result = await sendIframeRequest(this.iframe, "module:create", {
			card,
		});
		if (result) {
			this.store.set(card.id, result["data"]);
		}
		return { status: true };
	}
	async onDelete(card: CardType) {
		this.store.remove(card.id);
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
		const data: any = this.store.get(card.id);
		const code = this.capability.handler;
		const instanceIframe = buildPluginIframe({
			module: this.toolEvent,
			script: code,
			additionalData: [
				["DATA", data],
				["INSTANCE", card],
			],
		});
		const dispose = createRoot((dispose) => {
			render(
				() => (
					<div
						class="size-full"
						ref={(container) =>
							container.appendChild(instanceIframe)
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
