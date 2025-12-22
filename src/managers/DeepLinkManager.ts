import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { hollow } from "hollow";
import { createSignal } from "solid-js";

export class DeepLinkManager {
	private static self: DeepLinkManager;

	static init() {
		if (!this.self) {
			this.self = new DeepLinkManager();
		}
	}

	static getSelf() {
		this.init();
		return this.self;
	}

	private constructor() {
		this.start();
	}

	private async start() {
		onOpenUrl((urls) => {
			hollow.pevents.emit("deep-link", urls);
		});
	}
}
