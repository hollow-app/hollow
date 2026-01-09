import { Realm } from "@type/Realm";
import { Setter } from "solid-js";
import { Storage } from "./Storage";
import { appConfigDir, join } from "@tauri-apps/api/path";
import { hollow } from "hollow";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

export class RealmManager {
	private store: Storage;
	async start() {
		const path = await join(...[await appConfigDir(), "realms.json"]);
		this.store = await Storage.create({
			path,
			options: {
				defaults: {
					current: null,
					realms: [],
					selectOnStartup: false,
				},
			},
		});
	}
	getSelectOnStartup(): boolean {
		return this.store.get("selectOnStartup") ?? false;
	}
	setSelectOnStartup(v: boolean) {
		this.store.set("selectOnStartup", v);
	}
	getCurrent(): Realm | undefined {
		return this.getRealms().find((i) => i.id === this.store.get("current"));
	}

	public async enterRealm(realmId: string) {
		await this.store.getStore().set("current", realmId);
		await invoke("open_main_window");
		const window = getCurrentWindow();
		await window.close();
	}

	public addRealm(nRealm: Realm) {
		const realms = this.getRealms();
		realms.push(nRealm);
		this.store.set("realms", realms);
	}

	public removeRealm(realmId: string) {
		const realms = this.getRealms().filter((i) => i.id !== realmId);

		if (realmId === this.store.get("current")) {
			this.store.set("current", null);
		}
		this.store.set("realms", realms);
		localStorage.removeItem(`${realmId}-color-primary`);
		localStorage.removeItem(`${realmId}-color-secondary`);
	}

	public updateColors(obj: any) {
		const realm = this.getCurrent();
		if (realm) {
			realm.colors = { ...realm.colors, ...obj };
		}
		const realms = this.getRealms();
		const realmToUpdate = realms.find(
			(i) => i.id === this.store.get("current"),
		);
		if (realmToUpdate) {
			realmToUpdate.colors = realm.colors;
		}
		this.store.set("realms", realms);
	}

	public toggleRealm() {
		hollow.events.emit("confirm", {
			title: "Warning",
			message:
				"Switching realms requires a restart of the application.\\nWould you like to proceed?",

			onAccept: async () => {
				// Clear current realm
				await this.store.getStore().set("current", null);

				// Open selector window
				await invoke("open_realm_selector");

				// Close current window
				await getCurrentWindow().close();
			},
		});
	}

	public getRealmFromId(id: string) {
		return this.getRealms().find((i) => i.id === id);
	}

	public getRealms(): Realm[] {
		const realms = this.store.get("realms");
		return Array.isArray(realms) ? realms : [];
	}
}
