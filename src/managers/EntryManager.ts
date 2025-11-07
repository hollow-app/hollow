import { EntryType } from "@type/hollow";
import { RealmManager } from "./RealmManager";
import { hollow } from "hollow";

export class EntryManager {
	public entries: EntryType[] = [];
	private dbName: string = `${RealmManager.getSelf().getCurrent()}-entry`;
	private db: IDBDatabase | null = null;
	private static self: EntryManager;

	static getSelf() {
		if (!this.self) {
			this.self = new EntryManager();
		}
		return this.self;
	}
	async start() {
		this.initDB().then(() => this.loadEntries());
	}
	private constructor() {
		hollow.events.on("send-entry", (entry: EntryType) =>
			this.receiveEntry(entry),
		);
		hollow.events.on("remove-entry", (id: string) => this.removeEntry(id));
	}

	private async initDB(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, 1);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				if (!db.objectStoreNames.contains("entries")) {
					const store = db.createObjectStore("entries", {
						keyPath: "id",
					});
					store.createIndex("id", "id", { unique: true });
				}
			};

			request.onsuccess = (event) => {
				this.db = (event.target as IDBOpenDBRequest).result;
				resolve();
			};

			request.onerror = (event) => {
				console.error("IndexedDB error:", request.error);
				reject(event);
			};
		});
	}

	private async loadEntries(): Promise<void> {
		if (!this.db) return;
		const tx = this.db.transaction("entries", "readonly");
		const store = tx.objectStore("entries");
		const request = store.getAll();

		request.onsuccess = () => {
			this.entries = request.result ?? [];
			hollow.events.emit("entries", this.entries);
		};
	}

	public async receiveEntry(e: EntryType | EntryType[]): Promise<void> {
		const entries = Array.isArray(e) ? e : [e];
		const date = new Date().toISOString();

		for (const entry of entries) {
			const existing = this.entries.find((i) => i.id === entry.id);
			if (existing) {
				Object.assign(existing, {
					...entry,
					source: {
						...entry.source,
						icon: existing.source.icon,
					},
					createdAt: existing.createdAt,
					modifiedAt: date,
				});
			} else {
				this.entries.push({
					...entry,
					source: {
						...entry.source,
						icon:
							entry.source.icon ??
							hollow.toolManager
								.getHand()
								.find((i) => i.name === entry.source.tool).icon,
					},
					createdAt: date,
					modifiedAt: date,
				});
			}
		}

		await this.update();
	}

	public async removeEntry(id: string | string[]): Promise<void> {
		const ids = typeof id === "string" ? [id] : id;
		this.entries = this.entries.filter((i) => !ids.includes(i.id));
		await this.update();

		if (!this.db) return;
		const tx = this.db.transaction("entries", "readwrite");
		const store = tx.objectStore("entries");
		for (const entryId of ids) {
			store.delete(entryId);
		}
	}

	private async update(): Promise<void> {
		if (!this.db) return;

		return new Promise((resolve, reject) => {
			const tx = this.db!.transaction("entries", "readwrite");
			const store = tx.objectStore("entries");

			for (const entry of this.entries) {
				store.put(entry);
			}

			tx.oncomplete = () => {
				hollow.events.emit("entries", this.entries);
				resolve();
			};
			tx.onerror = () => {
				console.error("IndexedDB update error:", tx.error);
				reject(tx.error);
			};
			tx.onabort = () => {
				console.warn("IndexedDB transaction aborted");
				reject(tx.error);
			};
		});
	}
}
