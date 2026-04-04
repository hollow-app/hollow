import { ClientUser } from "center";
import { DeepLink } from "./deeplink";
import { hollow } from "hollow";
import { AlertType } from "@app/type/hollow";
import { _dispatch } from "@app/store/effects";
import { fetch } from "@tauri-apps/plugin-http";

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const WEBSITE_URL = import.meta.env.VITE_WEBSITE;
const DISCORD_OAUTH_URL = import.meta.env.VITE_OAUTH_DISCORD;

export class Auth {
	private static USER_STORAGE_KEY = "hollow_user_backup";
	private static AUTH_SIGNATURE_KEY = "hollow_auth_signature";

	static async signUp(body: {
		username: string;
		password: string;
		turnstileToken: string;
		discordId?: string;
	}): Promise<{
		success: boolean;
		recoveryKey?: string;
		error?: string;
		loginCode?: string;
	}> {
		const response = await fetch(WORKER_URL + "/sign-up", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			credentials: "include",
		});
		const data: {
			success: boolean;
			recoveryKey?: string;
			error?: string;
			loginCode?: string;
		} = await response.json();

		return data;
	}

	static async signIn(body: {
		username: string;
		password: string;
		turnstileToken: string;
	}): Promise<{ success: boolean; error?: string; loginCode?: string }> {
		try {
			const res = await fetch(WORKER_URL + "/sign-in", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
				credentials: "include",
			});
			if (!res.ok) return null;
			const data = await res.json();
			if (data.success) {
				// Rehydrate session to get user data and set it in context
				// await rehydrateSession(context, true);
				// json has loginCode only
				return data;
			}
			return null;
		} catch (e) {
			return null;
		}
	}

	/**
	 * Signs out the user by clearing the backup from local storage.
	 * Note: Token removal from cookies should be handled by the server
	 * or by navigating to a logout endpoint if necessary.
	 */
	static async signOut(): Promise<void> {
		localStorage.removeItem(this.USER_STORAGE_KEY);
		// If there's a backend signout endpoint, call it here
		try {
			await fetch(`${WORKER_URL}/auth/logout`, {
				method: "GET",
				credentials: "include",
			});
		} catch (error) {
			console.error("Failed to call logout endpoint:", error);
		}
	}

	/**
	 * Sign in logic via website.
	 * Generates a signature, stores it, and opens the auth URL in the browser.
	 */
	static async signInViaSite(): Promise<void> {
		const closeAlert = hollow.events.emit("alert", {
			type: "loading",
			message: "Sign in via website in your browser.",
		})[0];

		const signature = crypto.randomUUID();
		localStorage.setItem(this.AUTH_SIGNATURE_KEY, signature);
		const authUrl = new URL(`${WEBSITE_URL}/auth/app`);
		authUrl.searchParams.append("client_id", "desktop");
		authUrl.searchParams.append("redirect_uri", "hollow://auth/callback");
		authUrl.searchParams.append("response_type", "token");
		authUrl.searchParams.append("scope", "user");
		authUrl.searchParams.append("signature", signature);
		const { openUrl } = await import("@tauri-apps/plugin-opener");
		await openUrl(authUrl.toString());
		DeepLink.on(
			async (url: URL) => {
				console.log("Auth callback received via deep link");
				const signature = url.searchParams.get("signature");
				const loginCode = url.searchParams.get("loginCode");

				if (signature && loginCode) {
					await Auth.handleCallback(signature, loginCode, closeAlert);
				} else {
					console.error(
						"Missing signature or loginCode in auth callback",
					);
					closeAlert({
						type: "error",
						message: "Sign-in failed",
						duration: 5000,
					});
				}
			},
			{ host: "auth", pathname: "/callback" },
		);
	}

	/**
	 * Fetches the user object from the worker.
	 * If successful, updates the local storage backup.
	 * If it fails, returns the backup from local storage.
	 */
	static async getUser(): Promise<{
		user: ClientUser;
		kind: "online" | "offline";
	} | null> {
		if (hollow.pause.auth) return null;
		try {
			const response = await fetch(`${WORKER_URL}/initialize`, {
				method: "GET",
				credentials: "include",
			});

			if (!response.ok) {
				return { user: this.loadUserBackup(), kind: "offline" };
			}
			const data: { user: ClientUser } = await response.json();
			this.saveUserBackup(data.user);
			return { user: data.user, kind: "online" };
		} catch (error) {
			console.error("Failed to fetch user from worker:", error);
			return null;
		}
	}

	/**
	 * Checks if the user is considered signed in.
	 * Currently relies on the presence of a user backup.
	 */
	static isSignedIn(): boolean {
		return !!this.loadUserBackup();
	}

	private static saveUserBackup(user: ClientUser): void {
		try {
			localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
		} catch (error) {
			console.error("Failed to save user backup to localStorage:", error);
		}
	}

	private static loadUserBackup(): ClientUser | null {
		try {
			const data = localStorage.getItem(this.USER_STORAGE_KEY);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.error(
				"Failed to load user backup from localStorage:",
				error,
			);
			return null;
		}
	}
	/**
	 * Handles the deep link callback.
	 * Verifies the signature and exchanges the login code for tokens.
	 */
	static async handleCallback(
		signature: string,
		loginCode: string,
		closeAlert: (alert: AlertType) => void,
	): Promise<void> {
		const storedSignature = localStorage.getItem(this.AUTH_SIGNATURE_KEY);
		localStorage.removeItem(this.AUTH_SIGNATURE_KEY);
		if (!storedSignature || storedSignature !== signature) {
			console.error("Signature mismatch or no stored signature found");
			return;
		}
		console.info("Signature verified successfully");
		try {
			const response = await fetch(`${WORKER_URL}/auth/login-code`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					loginCode,
				}),
				credentials: "include",
			});
			if (response.ok) {
				console.info("User authenticated successfully via worker");
				const request = await this.getUser();
				if (request && request.user) {
					_dispatch({
						domain: "account",
						type: "set-user",
						user: request.user,
					});
					_dispatch({
						domain: "account",
						type: "set-connection",
						connection: { state: true, type: "online" },
					});
				}
				closeAlert({
					type: "success",
					message: "Sign-in success",
					duration: 5000,
				});
			} else {
				console.error("Failed to exchange login code for tokens");
				closeAlert({
					type: "error",
					message: "Sign-in failed",
					duration: 5000,
				});
			}
		} catch (error) {
			console.error("Error during auth callback exchange:", error);
		}
	}

	/**
	 * if userExist is true then the user is loginViaDiscord;
	 * if userExist is false but discord object exist then it's sign up;
	 * if username above exist then the user got verified;
	 */
	static async discordOauth(
		callback: (data: {
			discord: any;
			user: ClientUser | undefined;
			userExist: boolean;
		}) => void,
		options?: { verify?: boolean; username?: string },
	) {
		const signature = crypto.randomUUID();
		const url = new URL(DISCORD_OAUTH_URL);
		url.searchParams.append("state", signature);
		const { openUrl } = await import("@tauri-apps/plugin-opener");
		await openUrl(url.toString());
		DeepLink.on(
			async (url: URL) => {
				const error = url.searchParams.get("error");
				if (error) {
					throw new Error("Discord OAuth failed");
				}
				const code = url.searchParams.get("code");
				const state = url.searchParams.get("state");
				if (!code || !state) {
					return null;
				}
				if (state !== signature) throw new Error("Invalid state");
				const res = await fetch(WORKER_URL + "/auth/discord", {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ code, username: options.username }),
				});
				if (!res.ok) {
					throw new Error("Worker rejected OAuth code");
				}
				const data = await res.json();
				callback(data);
			},
			{ host: "oauth", pathname: "/discord" },
		);
	}

	static async recoverAccount(body: {
		username: string;
		recoveryKey: string;
		turnstileToken: string;
	}): Promise<{ success: boolean; code?: string; error?: string }> {
		const response = await fetch(WORKER_URL + "/recover-account", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const data = await response.json();
		if (!response.ok) throw new Error("Invalid: " + data.error);
		if (data.success) {
			return { success: true, code: data.code };
		} else {
			console.error("Error recover account: ", data.error);
			return { success: false, error: data.error };
		}
	}
	static async resetPassword(body: {
		code: string;
		password: string;
		turnstileToken: string;
	}): Promise<{ success: boolean; error?: string }> {
		const response = await fetch(WORKER_URL + "/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const data = await response.json();
		if (!response.ok) throw new Error("Invalid: " + data.error);
		if (data.success) {
			return { success: true };
		} else {
			console.error("Error reset password: ", data.error);
			return { success: false, error: data.error };
		}
	}
}
