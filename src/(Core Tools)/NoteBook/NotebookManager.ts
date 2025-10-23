import { NoteType } from "./NoteType";
import { NotebookType } from "./NotebookType";
import { DataBase, DataBaseRequest } from "@type/hollow";

export class NotebookManager {
	private db: DataBase;
	private static self: NotebookManager;

	static getSelf() {
		if (!this.self) {
			this.self = new NotebookManager();
		}
		return this.self;
	}

	constructor() {
		const request: DataBaseRequest = {
			pluginName: "notebookDB",
			version: 1,
			stores: [
				{
					name: "notebooks",
				},
				{
					name: "notes",
					indexes: [{ name: "by_notebook", keyPath: "notebookId" }],
				},
			],
			callback: (db) => (this.db = db),
		};
		window.hollowManager.emit("database", request);
	}

	async addNotebook(notebook: NotebookType): Promise<void> {
		await this.db.putData("notebooks", notebook.id, {
			...notebook,
			last: notebook.last ?? null,
		});
	}

	async updateNotebook(notebook: NotebookType): Promise<void> {
		await this.db.putData("notebooks", notebook.id, notebook);
	}

	async getNotebook(id: string): Promise<NotebookType | null> {
		const notebook = await this.db.getData<NotebookType>("notebooks", id);
		return notebook ?? null;
	}

	async deleteNotebook(notebookId: string): Promise<void> {
		await this.db.deleteData("notebooks", notebookId);
		const db = await this.db.getDBInstance();
		const tx = db.transaction("notes", "readwrite");
		const store = tx.objectStore("notes");
		const index = store.index("by_notebook");
		const range = IDBKeyRange.only(notebookId);
		const cursorRequest = index.openKeyCursor(range);

		return new Promise((resolve, reject) => {
			cursorRequest.onsuccess = () => {
				const cursor = cursorRequest.result;
				if (cursor) {
					store.delete(cursor.primaryKey);
					cursor.continue();
				} else {
					tx.oncomplete = () => resolve();
					tx.onerror = () => reject(tx.error);
				}
			};
			cursorRequest.onerror = () => reject(cursorRequest.error);
		});
	}

	async addNote(note: NoteType): Promise<void> {
		await this.db.putData("notes", note.id, note);
	}

	async updateNote(note: NoteType): Promise<void> {
		await this.db.putData("notes", note.id, note);
	}

	async getNotesForNotebook(notebookId: string): Promise<NoteType[]> {
		const db = await this.db.getDBInstance();
		const tx = db.transaction("notes", "readonly");
		const store = tx.objectStore("notes");
		const index = store.index("by_notebook");

		return new Promise((resolve, reject) => {
			const req = index.getAll(notebookId);
			req.onsuccess = () => resolve(req.result as NoteType[]);
			req.onerror = () => reject(req.error);
		});
	}

	async deleteNote(id: string): Promise<void> {
		await this.db.deleteData("notes", id);
	}

	async deleteNotesFromNotebook(
		notebookId: string,
		noteIds: string[],
	): Promise<void> {
		if (!noteIds.length) return;

		const db = await this.db.getDBInstance();
		const tx = db.transaction("notes", "readwrite");
		const store = tx.objectStore("notes");
		const index = store.index("by_notebook");
		const range = IDBKeyRange.only(notebookId);
		const cursorRequest = index.openCursor(range);

		return new Promise((resolve, reject) => {
			cursorRequest.onsuccess = () => {
				const cursor = cursorRequest.result;
				if (cursor) {
					if (noteIds.includes(cursor.value.id)) {
						store.delete(cursor.primaryKey);
					}
					cursor.continue();
				} else {
					tx.oncomplete = () => resolve();
					tx.onerror = () => reject(tx.error);
				}
			};
			cursorRequest.onerror = () => reject(cursorRequest.error);
		});
	}
}
