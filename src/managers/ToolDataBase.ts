import { DataBase } from "hollow-api";

export class ToolDataBase implements DataBase {
	private readonly dbName: string;
	private readonly dbVersion: number;
	private readonly storeName: string = "cards";

	constructor(pluginName: string, version: number) {
		this.dbName = pluginName;
		this.dbVersion = version;
	}

	private getRealmScopedKey(cardName: string): string {
		const realmId = window.realmManager.currentRealmId;
		return `${realmId}::${cardName}`;
	}

	private openDataBase(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				if (!db.objectStoreNames.contains(this.storeName)) {
					db.createObjectStore(this.storeName);
				}
			};

			request.onsuccess = (event) => {
				resolve((event.target as IDBOpenDBRequest).result);
			};

			request.onerror = (event) => {
				reject((event.target as IDBOpenDBRequest).error);
			};
		});
	}

	public async putData<T>(cardName: string, value: T): Promise<boolean> {
		const key = this.getRealmScopedKey(cardName);
		const db = await this.openDataBase();

		return new Promise((resolve) => {
			const transaction = db.transaction(this.storeName, "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.put(value, key);
			request.onsuccess = () => resolve(true);
			request.onerror = () => resolve(false);
		});
	}

	public async getData<T>(cardName: string): Promise<T | undefined> {
		const key = this.getRealmScopedKey(cardName);
		const db = await this.openDataBase();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(this.storeName, "readonly");
			const store = transaction.objectStore(this.storeName);
			const request = store.get(key);
			request.onsuccess = () => resolve(request.result as T | undefined);
			request.onerror = (event) =>
				reject((event.target as IDBRequest).error);
		});
	}

	public async deleteData(cardName: string): Promise<boolean> {
		const key = this.getRealmScopedKey(cardName);
		const db = await this.openDataBase();

		return new Promise((resolve) => {
			const transaction = db.transaction(this.storeName, "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.delete(key);
			request.onsuccess = () => resolve(true);
			request.onerror = () => resolve(false);
		});
	}
}
