import { load, Store, StoreOptions } from "@tauri-apps/plugin-store";

export class Storage {
	private store: Store;
	private data: Record<string, any> = {};

	private constructor(store: Store) {
		this.store = store;
	}

	static async create(path: string, options?: StoreOptions) {
		const store = await load(path, options);
		const instance = new Storage(store);
		await instance.init();
		return instance;
	}

	private async init() {
		const entries = await this.store.entries<any>();
		for (const [k, v] of entries) {
			this.data[k] = v;
		}
	}

	getData() {
		return this.data;
	}

	get<T>(key: string, defaultValue?: T): T | undefined {
		return (this.data[key] ?? defaultValue) as T | undefined;
	}

	set(key: string, value: any): void {
		this.data[key] = value;
		this.store
			.set(key, value)
			.catch((e) => console.error("Failed to persist key", key, e));
	}

	remove(key: string): void {
		delete this.data[key];
		this.store
			.delete(key)
			.catch((e) => console.error("Failed to delete key", key, e));
	}

	keys(): string[] {
		return Object.keys(this.data);
	}

	async save(): Promise<void> {
		await this.store.save();
	}

	async reload(): Promise<void> {
		await this.store.reload();
		await this.init();
	}
}
