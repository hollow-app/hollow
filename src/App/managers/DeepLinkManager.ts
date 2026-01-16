import { onOpenUrl } from "@tauri-apps/plugin-deep-link";

export class DeepLinkManager {
	async start() {
		onOpenUrl((urls) => {
			for (const raw of urls) {
				try {
					const url = new URL(raw);
					if (url.hostname === "auth") {
						// const token = url.searchParams.get("token");
					}
				} catch (err) {
					console.error("Bad deep link:", raw);
				}
			}
		});
	}
}
