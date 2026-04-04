import {
	IStore,
	LayoutCapability,
	PluginResult,
	rawPluginCapability,
	ToolApi,
} from "@app/type/hollow";
import { createRoot, JSX } from "solid-js";
import { buildPluginIframe } from ".";
import { render } from "solid-js/web";

export class LayoutMain implements LayoutCapability {
	private store: IStore;
	private capability: rawPluginCapability;
	private iframe: HTMLIFrameElement;
	private toolEvent: ToolApi;
	private localIframe: {
		iframe: HTMLIFrameElement;
		cleanup: () => void;
	};
	private dispose: () => void;
	constructor(
		iframe: HTMLIFrameElement,
		capability: rawPluginCapability,
		toolEvents: ToolApi,
	) {
		this.capability = capability;
		this.iframe = iframe;
		this.toolEvent = toolEvents;
		const code = this.capability.handler;
		const panelIframe = buildPluginIframe({
			module: this.toolEvent,
			script: code,
			additionalData: [["TYPE", "ui"]],
		});
		this.localIframe = panelIframe;
	}
	async mount(el: Element): Promise<PluginResult> {
		const dispose = createRoot((dispose) => {
			render(
				() => (
					<div
						class="size-full"
						ref={(container) =>
							container.appendChild(this.localIframe.iframe)
						}
					/>
				),
				el,
			);
			return dispose;
		});
		this.dispose = dispose;
		return { status: true };
	}
	async unMount(): Promise<PluginResult> {
		if (this.dispose) {
			this.dispose();
		}
		return { status: true };
	}

	private failure(message: string, error: unknown): PluginResult {
		return {
			status: false,
			message,
			error: error instanceof Error ? error : undefined,
		};
	}
}
