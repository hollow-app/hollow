// KanbanManager.ts
import { ContextMenuItem } from "@type/hollow";
import { KanbanColumnType } from "./KanbanColumnType";

export class KanbanManager {
	private dbPromise: Promise<IDBDatabase> | null = null;

	constructor() {
		this.dbPromise = this.openDB();
	}

	private openDB(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("kanbanDB", 1);

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains("columns")) {
					db.createObjectStore("columns", { keyPath: "id" });
				}
			};

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async getColumn(columnId: string): Promise<KanbanColumnType | null> {
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db!.transaction("columns", "readonly");
			const store = tx.objectStore("columns");
			const request = store.get(columnId);

			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	}

	async saveColumn(column: KanbanColumnType): Promise<void> {
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db!.transaction("columns", "readwrite");
			const store = tx.objectStore("columns");
			store.put(column);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	}

	// async sendItemToColumn(
	// 	itemsId: string[],
	// 	targetColumnId: string,
	// ): Promise<void> {
	// 	// TODO: Send the item to another column using the app's API
	//
	// }

	/** Clears this column completely */
	async clearColumn(column: KanbanColumnType): Promise<void> {
		const emptyColumn = {
			...column,
			items: [],
		};
		await this.saveColumn(emptyColumn);
	}

	async removeColumn(columnId: string): Promise<void> {
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db!.transaction("columns", "readwrite");
			const store = tx.objectStore("columns");
			const request = store.delete(columnId);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
}
