import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { Auth } from "./auth";

export class DeepLink {
	private static listeners: {
		[id: string]: (
			url: URL,
			target: { host: string; pathname: string },
		) => void;
	} = {};
	/**
	 * Initializes the deep link listener.
	 * Listens for the hollow:// auth callback and refreshes user state.
	 */
	static async listen(): Promise<void> {
		await onOpenUrl(async (urls) => {
			for (const urlStr of urls) {
				const url = new URL(urlStr);
				console.log("deeplink: ", url);
				if (url.protocol === "hollow:") {
					for (const listener of Object.values(this.listeners)) {
						listener(url, {
							pathname: url.pathname,
							host: url.host,
						});
					}
					//
				}
			}
		});
	}
	static on(
		listener: (url: URL) => void,
		options: { host: string; pathname: string },
	) {
		const id = crypto.randomUUID();
		const fn = (url: URL, target: { host: string; pathname: string }) => {
			if (
				options.host === target.host &&
				options.pathname === target.pathname
			) {
				listener(url);
				delete this.listeners[id];
			}
		};
		this.listeners[id] = fn;
	}
}
