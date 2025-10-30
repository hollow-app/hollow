import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { hollow } from "hollow";
import { openUrl } from "@tauri-apps/plugin-opener";
import { SecretsManager } from "./SecretsManager";

type AccessTokenResponse = {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
};

export class DeepLinkManager {
	private static self: DeepLinkManager;
	private discordToken: AccessTokenResponse;
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
		onOpenUrl((urls) => {
			hollow.pevents.emit("deep-link", urls);
		});
	}
	logIn() {
		const { generatedUrl, redirectUri, clientId, clientSecret } =
			SecretsManager.getSelf().getSecrets().discord;
		openUrl(generatedUrl);
		hollow.pevents.on("deep-link", async (urls) => {
			console.log(urls);
			const params = new URLSearchParams(urls[0]);
			const code = params.get("code");
			if (code) {
				const body = new URLSearchParams({
					grant_type: "authorization_code",
					code,
					redirectUri,
				});

				const auth = btoa(`${clientId}:${clientSecret}`);

				const response = await fetch(
					"https://discord.com/api/v10/oauth2/token",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
							Authorization: `Basic ${auth}`,
						},
						body: body.toString(),
					},
				);

				if (!response.ok)
					throw new Error(`Token request failed: ${response.status}`);

				const tokenData = await response.json();
				this.discordToken = tokenData;
				console.log(this.discordToken);
				const encrypted =
					await SecretsManager.getSelf().encryptObject(tokenData);
				localStorage.setItem("discord_token", encrypted);
			}
		});
	}
}
