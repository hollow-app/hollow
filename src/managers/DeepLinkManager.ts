import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { Clerk } from "@clerk/clerk-js";
import { hollow } from "hollow";
import { openUrl } from "@tauri-apps/plugin-opener";
import { bind, listen, unbind, send } from "@kuyoonjo/tauri-plugin-tcp";
import { Buffer } from "buffer";
import EmailAuthCompletePage from "@assets/pages/email-auth-complete.html?raw";
import DiscordAuthCompletePage from "@assets/pages/discord-auth-complete.html?raw";
import { finished } from "stream";

export class DeepLinkManager {
	private static self: DeepLinkManager;
	private clerk: Clerk = null;
	private discord = {
		redirectUri: "http://localhost:43591/auth/discord",
		generatedUrl:
			"https://discord.com/oauth2/authorize?client_id=1433277127817695386&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A43591%2Fauth%2Fdiscord&scope=identify",
	};

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

	public setUpClerk() {
		if (!this.clerk) {
			const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
			this.clerk = new Clerk(clerkPubKey);
		}
	}

	public buildClerk(signin_div: HTMLDivElement) {
		this.setUpClerk();
		// if (this.clerk.isSignedIn) {
		// 	const userButtonDiv = document.getElementById(
		// 		"clerk-user-button",
		// 	) as HTMLDivElement;
		//
		// 	this.clerk.mountUserButton(userButtonDiv);
		// } else {
		this.clerk.mountSignIn(signin_div);
		// }
	}

	async sign_up_discord(rebounce: () => void) {
		const onFinished = hollow.events.emit("alert", {
			type: "loading",
			title: "Hang tight!",
			message: "Processing your registration... please check your email.",
		});
		try {
			const { generatedUrl, redirectUri } = this.discord;
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
					if (code) {
						const body = new URLSearchParams({
							grant_type: "authorization_code",
							code,
							redirect_uri: redirectUri,
						});

						const response = await fetch(
							import.meta.env.VITE_WORKER_URL,
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									type: "discord-auth",
									extra: { body },
								}),
							},
						);

						if (!response.ok)
							throw new Error(
								`Token request failed: ${response.status}`,
							);

						const tokenData = await response.text();
						localStorage.setItem("discord_token", tokenData);
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
		} catch (error) {
			console.error("Error completing magic link sign-in:", error);
			hollow.events.emit("alert", {
				type: "error",
				title: "Failed",
				message: "Sign-up using email failed",
			});
		} finally {
			onFinished();
			rebounce?.();
		}
	}

	// async sign_up_email(email: string, name: string, rebounce?: () => void) {
	// 	const onFinished = hollow.events.emit("alert", {
	// 		type: "loading",
	// 		title: "Hang tight!",
	// 		message: "Processing your registration... please check your email.",
	// 	});
	// 	const serverId = "firebase-auth";
	// 	const auth = getAuth();
	// 	const actionCodeSettings = {
	// 		url: "http://localhost:43591/auth/firebase",
	// 		handleCodeInApp: true,
	// 	};
	// 	await sendSignInLinkToEmail(auth, email, actionCodeSettings);
	// 	console.log("sign-up email sent to:", email);
	// 	await bind(serverId, "127.0.0.1:43591");
	//
	// 	await listen(async (event) => {
	// 		const raw = Buffer.from(
	// 			event.payload.event.message?.data ?? [],
	// 		).toString();
	// 		if (!raw.includes("GET /auth/firebase")) return;
	// 		try {
	// 			const [, pathWithQuery] = raw.split(" ");
	// 			const firebaseLink = "http://localhost:43591" + pathWithQuery;
	//
	// 			if (!isSignInWithEmailLink(auth, firebaseLink)) {
	// 				hollow.events.emit("alert", {
	// 					type: "error",
	// 					title: "Failed",
	// 					message: "Invalid email link",
	// 				});
	// 				throw new Error("Invalid email link");
	// 			}
	// 			const userCredential = await signInWithEmailLink(
	// 				auth,
	// 				email,
	// 				firebaseLink,
	// 			);
	// 			const user = userCredential.user;
	// 			await updateProfile(user, { displayName: name ?? "User" });
	// 			console.log("User signed-in successful");
	// 			localStorage.setItem("firebase_user", JSON.stringify(user));
	//
	// 			const htmlResponse =
	// 				"HTTP/1.1 200 OK\r\n" +
	// 				"Content-Type: text/html\r\n" +
	// 				"Connection: close\r\n\r\n" +
	// 				EmailAuthCompletePage;
	//
	// 			await send(
	// 				serverId,
	// 				htmlResponse,
	// 				event.payload.event.message?.addr ?? "",
	// 			);
	// 			await unbind(serverId);
	// 		} catch (error) {
	// 			console.error("Error completing magic link sign-in:", error);
	// 			hollow.events.emit("alert", {
	// 				type: "error",
	// 				title: "Failed",
	// 				message: "Sign-up using email failed",
	// 			});
	// 		} finally {
	// 			onFinished();
	// 			rebounce?.();
	// 		}
	// 	});
	// }
}
