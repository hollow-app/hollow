import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { Clerk } from "@clerk/clerk-js";
import { ReactiveManager } from "./ReactiveManager";

interface DeepLinkState {
	clerk: Clerk | null;
	isSignedIn: boolean;
}

export class DeepLinkManager extends ReactiveManager<DeepLinkState> {
	constructor() {
		super({ clerk: null, isSignedIn: false });
	}

	async start() {
		onOpenUrl((urls) => {
			for (const raw of urls) {
				try {
					const url = new URL(raw);
					if (url.pathname === "/web/auth") {
						const token = url.searchParams.get("token");
						this.signIn(token);
					}
				} catch (err) {
					console.error("Bad deep link:", raw);
				}
			}
		});

		await this.setupClerk();
	}

	private async setupClerk() {
		if (this.get().clerk) return;

		const clerk = new Clerk(
			import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY,
		);
		await clerk.load({});
		this.set({ clerk });
	}
	private async signIn(token: string) {
		try {
			const clerk = this.get().clerk;
			if (!clerk) return;
			if (clerk.isSignedIn) return;
			const signIn = await clerk.client.signIn.create({
				strategy: "ticket",
				ticket: token,
			});
			if (signIn.status === "complete") {
				await clerk.setActive({
					session: signIn.createdSessionId,
				});
			} else {
				throw new Error("Ticket sign-in not complete");
			}
		} catch (e) {
			console.error("Failed sign-in:", e);
		}
	}

	onClerkReady(cb: (clerk: Clerk | null) => void) {
		return this.subscribe((clerk) => cb(clerk), "clerk");
	}
}
