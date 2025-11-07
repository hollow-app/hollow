import { Realm } from "@type/Realm";
import { Setter } from "solid-js";
import { RustManager } from "./RustManager";
import { exists, mkdir } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

export class RealmManager {
	public realms: Realm[] = [];
	public currentRealmId: string = undefined;
	private setCurrentRealm: Setter<string> = null;
	private static self: RealmManager;

	private constructor() {
		const savedRealms = localStorage.getItem("realms") ?? "[]";
		this.realms = JSON.parse(savedRealms);
		this.currentRealmId = localStorage.currentRealmId;
	}
	static getSelf() {
		if (!this.self) {
			this.self = new RealmManager();
		}
		return this.self;
	}
	getCurrent<T extends boolean | undefined>(
		obj?: T,
	): T extends true ? Realm : string {
		if (obj) {
			return this.realms.find((i) => i.id === this.currentRealmId) as any;
		}
		return this.currentRealmId as any;
	}
	public init(setCurrentRealm: Setter<string>) {
		this.setCurrentRealm = setCurrentRealm;
	}

	public async enterRealm(realmId: string, ignoreReload?: boolean) {
		this.currentRealmId = realmId;
		localStorage.currentRealmId = realmId;
		this.setCurrentRealm(realmId);
		// reload the app or open it in a new window.
		ignoreReload && RustManager.getSelf().reload();
	}
	public addRealm(nRealm: Realm) {
		this.realms.push(nRealm);
		this.update();
	}
	public removeRealm(realmId: string) {
		this.realms = this.realms.filter((i) => i.id !== realmId);
		if (realmId === this.currentRealmId) {
			this.enterRealm(null);
		}
		this.update();
		localStorage.removeItem(`${realmId}-color-primary`);
		localStorage.removeItem(`${realmId}-color-secondary`);
		localStorage.removeItem(`${realmId}-canvas`);
		localStorage.removeItem(`${realmId}-tools`);
	}

	private update() {
		localStorage.setItem("realms", JSON.stringify(this.realms));
	}

	public updateColors(obj: any) {
		const realm = this.getCurrent(true);
		if (realm) {
			realm.colors = { ...realm.colors, ...obj };
		}
	}

	public toggleRealm() {
		this.setCurrentRealm((prev: string) =>
			prev === undefined ? this.currentRealmId : undefined,
		);
	}
	public getRealmFromId(id: string) {
		return this.realms.find((i) => i.id === id);
	}
}
