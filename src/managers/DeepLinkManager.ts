import { onOpenUrl } from "@tauri-apps/plugin-deep-link";

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
	static async start() {
		this.init();
		await onOpenUrl((urls) => {
			console.log("deep link:", urls);
		});
	}
}
