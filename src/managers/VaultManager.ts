import { VaultItem } from "@type/VaultItem";
import { RustManager } from "./RustManager";
import { appDataDir, join } from "@tauri-apps/api/path";
import { RealmManager } from "./RealmManager";
import { copyFile } from "@tauri-apps/plugin-fs";

export default class VaultManager {
	private db: Promise<IDBDatabase> = this.openDB();
	private vault: VaultItem[] = [];
	private static self: VaultManager;

	public async start() {
		this.vault = (await this.getFromDB()) ?? [];
	}

	static getSelf() {
		if (!this.self) {
			this.self = new VaultManager();
		}
		return this.self;
	}

	public getVault() {
		return this.vault;
	}

	public async editItem(editedParts: any) {
		const db = await this.db;
		return new Promise<void>((resolve, reject) => {
			const tx = db.transaction("vault", "readwrite");
			const store = tx.objectStore("vault");
			const getReq = store.get(editedParts.id);
			getReq.onsuccess = () => {
				const existing = getReq.result;
				if (existing) {
					const updated = { ...existing, ...editedParts };
					const putReq = store.put(updated);
					putReq.onsuccess = () => resolve();
					putReq.onerror = () => reject(putReq.error);
				} else {
					reject(new Error("Item not found"));
				}
			};
			getReq.onerror = () => reject(getReq.error);
		});
	}

	public async addItem(item: VaultItem, source: string) {
		this.vault = [...this.vault, { ...item }];
		this.addToDB(item);
		await RustManager.getSelf().vault_add({
			source: source,
			name: `${item.id}.${item.type}`,
		});
	}

	public async removeItem(id: string) {
		const target = this.vault.find((i) => i.id === id);
		const full_name = `${target.id}.${target.type}`;
		await RustManager.getSelf().vault_remove({ name: full_name });
		const db = await this.db;
		return new Promise<void>((resolve, reject) => {
			const tx = db.transaction("vault", "readwrite");
			const store = tx.objectStore("vault");
			const req = store.delete(id);
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	}

	private openDB(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("vault", 1);
			request.onupgradeneeded = () => {
				const db = request.result;
				db.createObjectStore("vault", { keyPath: "id" });
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	private async getFromDB<T>(): Promise<any> {
		const db = await this.db;
		return new Promise((resolve, reject) => {
			const tx = db.transaction("vault", "readonly");
			const store = tx.objectStore("vault");
			const req = store.getAll();
			req.onsuccess = () => resolve(req.result ?? null);
			req.onerror = () => reject(req.error);
		});
	}

	private async addToDB<T>(value: T): Promise<void> {
		const db = await this.db;
		return new Promise((resolve, reject) => {
			const tx = db.transaction("vault", "readwrite");
			const store = tx.objectStore("vault");
			const req = store.add(value);
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	}
}
