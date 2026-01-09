import { DataBase } from "@type/hollow";

export interface StoreSchema {
	name: string;
	options?: IDBObjectStoreParameters;
	indexes?: {
		name: string;
		keyPath: string | string[];
		options?: IDBIndexParameters;
	}[];
}

export class ToolDataBase implements DataBase {
	private readonly dbName: string;
	private readonly dbVersion: number;
	private dbInstance: IDBDatabase | null = null;
	private readonly schemas: StoreSchema[];

	constructor(pluginName: string, version: number, stores?: StoreSchema[]) {
		this.dbName = pluginName;
		this.dbVersion = version;
		this.schemas = stores ?? [{ name: "cards" }];
	}

	private async openDataBase(): Promise<IDBDatabase> {
		if (this.dbInstance) return this.dbInstance;

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				for (const schema of this.schemas) {
					let store: IDBObjectStore;
					if (!db.objectStoreNames.contains(schema.name)) {
						store = db.createObjectStore(
							schema.name,
							schema.options,
						);
					} else {
						store = request.transaction!.objectStore(schema.name);
					}

					schema.indexes?.forEach((idx) => {
						if (!store.indexNames.contains(idx.name)) {
							store.createIndex(
								idx.name,
								idx.keyPath,
								idx.options,
							);
						}
					});
				}
			};

			request.onsuccess = (event) => {
				this.dbInstance = (event.target as IDBOpenDBRequest).result;
				resolve(this.dbInstance);
			};

			request.onerror = () => reject(request.error);
		});
	}
	public async getDBInstance(): Promise<IDBDatabase> {
		return this.openDataBase();
	}

	public async putData<T>(
		storeName: string,
		key: string,
		value: T,
	): Promise<boolean> {
		const db = await this.openDataBase();

		return new Promise((resolve) => {
			const tx = db.transaction(storeName, "readwrite");
			const store = tx.objectStore(storeName);
			const req = store.put(value, key);
			req.onsuccess = () => resolve(true);
			req.onerror = () => resolve(false);
		});
	}

	public async getData<T>(
		storeName: string,
		key: string,
	): Promise<T | undefined> {
		const db = await this.openDataBase();

		return new Promise((resolve, reject) => {
			const tx = db.transaction(storeName, "readonly");
			const store = tx.objectStore(storeName);
			const req = store.get(key);
			req.onsuccess = () => resolve(req.result as T | undefined);
			req.onerror = () => reject(req.error);
		});
	}

	public async deleteData(storeName: string, key: string): Promise<boolean> {
		const db = await this.openDataBase();

		return new Promise((resolve) => {
			const tx = db.transaction(storeName, "readwrite");
			const store = tx.objectStore(storeName);
			const req = store.delete(key);
			req.onsuccess = () => resolve(true);
			req.onerror = () => resolve(false);
		});
	}

	public async getAllData<T>(storeName: string): Promise<T[]> {
		const db = await this.openDataBase();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(storeName, "readonly");
			const store = tx.objectStore(storeName);
			const req = store.getAll();
			req.onsuccess = () => resolve(req.result as T[]);
			req.onerror = () => reject(req.error);
		});
	}

	public async clearStore(storeName: string): Promise<boolean> {
		const db = await this.openDataBase();
		return new Promise((resolve) => {
			const tx = db.transaction(storeName, "readwrite");
			const store = tx.objectStore(storeName);
			const req = store.clear();
			req.onsuccess = () => resolve(true);
			req.onerror = () => resolve(false);
		});
	}

	public async deleteDatabase(): Promise<boolean> {
		this.dbInstance?.close();
		this.dbInstance = null;

		return new Promise((resolve, reject) => {
			const request = indexedDB.deleteDatabase(this.dbName);
			request.onsuccess = () => resolve(true);
			request.onerror = () => reject(request.error);
		});
	}
}
