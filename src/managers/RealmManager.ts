import { Realm } from "@type/Realm";
import { Setter } from "solid-js";
import { RustManager } from "./RustManager";
import { Storage } from "./Storage";
import { appConfigDir, join } from "@tauri-apps/api/path";
import { hollow } from "hollow";
import { manager } from "./index";

export class RealmManager {
	public currentRealmId: string | null = null;
	private setCurrentRealm: Setter<string> = null;
	private store: Storage;

	constructor() {
		this.currentRealmId = localStorage.currentRealmId;
	}

	async start() {
		const path = await join(...[await appConfigDir(), "realms.json"]);
		this.store = await Storage.create({
			path,
			options: { defaults: { __root__: [] } },
		});
	}

	getCurrent(): Realm | undefined {
		return this.getRealms().find((i) => i.id === this.currentRealmId);
	}
	public init(setCurrentRealm: Setter<string>) {
		this.setCurrentRealm = setCurrentRealm;
	}

	public async enterRealm(realmId: string, reload?: boolean) {
		this.currentRealmId = realmId;
		localStorage.currentRealmId = realmId;
		reload ? manager.rust.reload() : this.setCurrentRealm(realmId);
	}
	public addRealm(nRealm: Realm) {
		const realms = this.getRealms();
		realms.push(nRealm);
		this.store.set("__root__", realms);
	}
	public removeRealm(realmId: string) {
		const realms = this.getRealms().filter((i) => i.id !== realmId);
		if (realmId === this.currentRealmId) {
			this.enterRealm(null);
		}
		this.store.set("__root__", realms);
		localStorage.removeItem(`${realmId}-color-primary`);
		localStorage.removeItem(`${realmId}-color-secondary`);
		localStorage.removeItem(`${realmId}-canvas`);
	}

	public updateColors(obj: any) {
		const realm = this.getCurrent();
		if (realm) {
			realm.colors = { ...realm.colors, ...obj };
		}
		const realms = this.getRealms();
		realms.find((i) => i.id === this.currentRealmId).colors = realm.colors;
		this.store.set("__root__", realms);
	}

	public toggleRealm() {
		hollow.events.emit("confirm", {
			title: "Warning",
			message:
				"Switching realms requires a restart of the application.\nWould you like to proceed?",

			onAccept: () => {
				this.setCurrentRealm((prev: string) =>
					prev === undefined ? this.currentRealmId : undefined,
				);
			},
		});
	}
	public getRealmFromId(id: string) {
		return this.getRealms().find((i) => i.id === id);
	}
	public getRealms(): Realm[] {
		return this.store.get("__root__");
	}
}
