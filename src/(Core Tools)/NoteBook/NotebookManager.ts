import { NoteType } from "./NoteType";
import { NotebookType } from "./NotebookType";

export class NotebookManager {
	private dbPromise: Promise<IDBDatabase> | null = null;

	constructor() {
		this.dbPromise = this.openDB();
	}

	async addNotebook(notebook: NotebookType): Promise<void> {
		const store = await this.tx("notebooks", "readwrite");
		return new Promise((resolve, reject) => {
			const req = store.add({
				...notebook,
				last: notebook.last ?? null,
			});
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	}

	async updateNotebook(notebook: NotebookType): Promise<void> {
		const store = await this.tx("notebooks", "readwrite");
		return new Promise((resolve, reject) => {
			const req = store.put(notebook);
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	}

	async getNotebook(id: string): Promise<NotebookType | null> {
		const store = await this.tx("notebooks", "readonly");
		return new Promise((resolve, reject) => {
			const req = store.get(id);
			req.onsuccess = () => resolve(req.result ?? null);
			req.onerror = () => reject(req.error);
		});
	}

	async deleteNotebook(id: string): Promise<void> {
		const db = await this.getDB();
		const tx = db.transaction(["notebooks", "notes"], "readwrite");
		const notebooksStore = tx.objectStore("notebooks");
		const notesStore = tx.objectStore("notes");
		const index = notesStore.index("by_notebook");

		notebooksStore.delete(id);

		const range = IDBKeyRange.only(id);
		const cursorReq = index.openKeyCursor(range);

		cursorReq.onsuccess = () => {
			const cursor = cursorReq.result;
			if (cursor) {
				notesStore.delete(cursor.primaryKey);
				cursor.continue();
			}
		};

		return new Promise((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	}

	async addNote(note: NoteType): Promise<void> {
		const store = await this.tx("notes", "readwrite");
		return new Promise((resolve, reject) => {
			const req = store.add(note);
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	}

	async updateNote(note: NoteType): Promise<void> {
		const store = await this.tx("notes", "readwrite");
		return new Promise((resolve, reject) => {
			const req = store.put(note);
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	}

	async getNotesForNotebook(notebookId: string): Promise<NoteType[]> {
		const store = await this.tx("notes", "readonly");
		const index = store.index("by_notebook");
		const range = IDBKeyRange.only(notebookId);

		return new Promise((resolve, reject) => {
			const req = index.getAll(range);
			req.onsuccess = () => resolve(req.result ?? []);
			req.onerror = () => reject(req.error);
		});
	}

	async deleteNote(id: string): Promise<void> {
		const store = await this.tx("notes", "readwrite");
		return new Promise((resolve, reject) => {
			const req = store.delete(id);
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	}

	private openDB(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("notebookDB", 1);

			request.onupgradeneeded = () => {
				const db = request.result;

				if (!db.objectStoreNames.contains("notebooks")) {
					db.createObjectStore("notebooks", { keyPath: "id" });
				}

				if (!db.objectStoreNames.contains("notes")) {
					const notesStore = db.createObjectStore("notes", {
						keyPath: "id",
					});
					notesStore.createIndex("by_notebook", "notebookId");
				}
			};

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	private async getDB(): Promise<IDBDatabase> {
		if (!this.dbPromise) this.dbPromise = this.openDB();
		return this.dbPromise;
	}

	private async tx(
		storeName: string,
		mode: IDBTransactionMode,
	): Promise<IDBObjectStore> {
		const db = await this.getDB();
		return db.transaction(storeName, mode).objectStore(storeName);
	}
}
