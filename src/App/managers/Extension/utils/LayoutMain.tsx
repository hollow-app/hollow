import { PanelCapability, PluginResult } from "@app/type/hollow";
import { JSX } from "solid-js";

export class LayoutMain implements PanelCapability {
	async mount(el: Element): Promise<JSX.Element> {
		return <div />;
	}
	async unMount(): Promise<PluginResult> {
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
