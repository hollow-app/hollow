import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { Clerk } from "@clerk/clerk-js";

type AuthListener = (token: string) => void;
type ClerkListener = (clerk: Clerk) => void;

export class DeepLinkManager {
	private clerk: Clerk | null = null;
	private authListeners = new Set<AuthListener>();
	private clerkListeners = new Set<ClerkListener>();

	async start() {
		onOpenUrl((urls) => {
			for (const raw of urls) {
				try {
					const url = new URL(raw);
					if (url.pathname === "/web/auth") {
						const token = url.searchParams.get("token");
						if (token) this.emitAuthToken(token);
					}
				} catch (err) {
					console.error("Bad deep link:", raw);
				}
			}
		});

		await this.setupClerk();
	}

	private async setupClerk() {
		if (this.clerk) return;

		this.clerk = new Clerk(
			import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY,
		);
		await this.clerk.load({});
		this.clerkListeners.forEach((l) => l(this.clerk!));
	}

	onAuthToken(cb: AuthListener) {
		this.authListeners.add(cb);
		return () => this.authListeners.delete(cb);
	}

	onClerkReady(cb: ClerkListener) {
		if (this.clerk) cb(this.clerk);
		this.clerkListeners.add(cb);
		return () => this.clerkListeners.delete(cb);
	}

	private emitAuthToken(token: string) {
		this.authListeners.forEach((l) => l(token));
	}
}
