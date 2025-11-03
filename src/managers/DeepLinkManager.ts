import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { hollow } from "hollow";
import { openUrl } from "@tauri-apps/plugin-opener";
import { SecretsManager } from "./SecretsManager";
import { bind, listen, unbind, send } from "@kuyoonjo/tauri-plugin-tcp";
import { Buffer } from "buffer";
import DiscordAuthCompletePage from "@assets/pages/discord-auth-complete.html?raw";

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
		this.start();
	}
	private async start() {
		onOpenUrl((urls) => {
			hollow.pevents.emit("deep-link", urls);
		});
		this.discordToken = (await SecretsManager.getSelf().decryptObject(
			localStorage.discord_token,
		)) as AccessTokenResponse;
	}
	async loginDiscord() {
		const { generatedUrl, redirectUri, clientId, clientSecret } =
			SecretsManager.getSelf().getSecrets().discord;
		const serverId = "discord-auth";
		openUrl(generatedUrl);
		await bind(serverId, "127.0.0.1:43591");

		await listen(async (event) => {
			const msg = Buffer.from(
				event.payload.event.message?.data ?? [],
			).toString();

			if (msg.includes("GET /auth/discord")) {
				const [, pathWithQuery] = msg.split(" ");
				const url = new URL("http://localhost" + pathWithQuery);
				const code = url.searchParams.get("code");
				// const state = url.searchParams.get("state");
				if (code) {
					const body = new URLSearchParams({
						grant_type: "authorization_code",
						code,
						redirect_uri: redirectUri,
					});

					const auth = btoa(`${clientId}:${clientSecret}`);

					const response = await fetch(
						"https://discord.com/api/v10/oauth2/token",
						{
							method: "POST",
							headers: {
								"Content-Type":
									"application/x-www-form-urlencoded",
								Authorization: `Basic ${auth}`,
							},
							body: body.toString(),
						},
					);

					if (!response.ok)
						throw new Error(
							`Token request failed: ${response.status}`,
						);

					const tokenData = await response.json();
					this.discordToken = tokenData;
					// console.log(this.discordToken);
					const encrypted =
						await SecretsManager.getSelf().encryptObject(tokenData);
					localStorage.setItem("discord_token", encrypted);
				}
				const htmlResponse = `
					HTTP/1.1 200 OK\r\n
					Content-Type: text/html\r\n
					Connection: close\r\n
					\r\n
					${DiscordAuthCompletePage}
				`;
				await send(
					serverId,
					htmlResponse,
					event.payload.event.message?.addr ?? "",
				);

				await unbind(serverId);
			}
		});
	}

	async getDiscordData() {
		const { token_type, access_token } = this.discordToken;
		try {
			const response = await fetch("https://discord.com/api/users/@me", {
				headers: { Authorization: `${token_type} ${access_token}` },
			});
			const data = await response.json();
		} catch (e) {
			console.error(e);
		}
	}
}
