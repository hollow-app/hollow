import { VaultItem } from "@type/VaultItem";

export default class VaultManager {
	private db: Promise<IDBDatabase>;
	private vault: VaultItem[] = [];
	private static self: VaultManager;

	public async start() {
		this.db = this.openDB();
		this.vault = (await this.getFromDB()) ?? [];
	}

	static getSelf() {
		if (!this.self) {
			this.self = new VaultManager();
		}
		return this.self;
	}

	public addItem(item: VaultItem) {
		this.vault.push(item);
		this.addToDB(item);
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

	public async removeItem(id: string) {
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
				const store = db.createObjectStore("vault", { keyPath: "id" });
				store.createIndex("type", "type", { unique: false });
				store.createIndex("tags", "tags", { multiEntry: true });
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
			const index = store.index("type");
			const req = index.getAll("image");
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
