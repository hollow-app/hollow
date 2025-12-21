import { load, Store } from "@tauri-apps/plugin-store";
import { StoreType } from "@type/hollow";

export class Storage {
	private store: Store | null;
	private data: Record<string, any> = {};
	private disposed = false;

	private constructor(store: Store) {
		this.store = store;
	}

	static async create({ path, options }: StoreType) {
		const store = await load(path, options);
		try {
			await store.reload({ ignoreDefaults: true });
		} catch (e) {
			console.warn("Store file did not exist yet, skipping reload");
		}
		const instance = new Storage(store);
		await instance.init();
		return instance;
	}

	private async init() {
		if (!this.store) return;
		const entries = await this.store.entries<any>();
		for (const [k, v] of entries) {
			this.data[k] = v;
		}
	}

	getData() {
		this.ensureNotDisposed();
		return this.data;
	}

	get<T>(key: string, defaultValue?: T): T | undefined {
		this.ensureNotDisposed();
		return (this.data[key] ?? defaultValue) as T | undefined;
	}

	set(key: string, value: any): void {
		this.ensureNotDisposed();
		this.data[key] = value;
		this.store!.set(key, value).catch((e) =>
			console.error("Failed to persist key", key, e),
		);
	}

	setMany(values: Record<string, any>): void {
		this.ensureNotDisposed();
		for (const [key, value] of Object.entries(values)) {
			this.data[key] = value;
			this.store!.set(key, value);
		}
	}

	remove(key: string): void {
		this.ensureNotDisposed();
		delete this.data[key];
		this.store!.delete(key).catch((e) =>
			console.error("Failed to delete key", key, e),
		);
	}

	keys(): string[] {
		this.ensureNotDisposed();
		return Object.keys(this.data);
	}

	async save(): Promise<void> {
		this.ensureNotDisposed();
		await this.store!.save();
	}

	async reload(): Promise<void> {
		this.ensureNotDisposed();
		await this.store!.reload();
		await this.init();
	}

	async close(): Promise<void> {
		if (this.disposed) return;
		if (this.store) {
			try {
				await this.store.save();
				await this.store.close();
			} catch (e) {
				console.error("Error closing store:", e);
			}
		}
		this.store = null;
		this.data = {};
		this.disposed = true;
	}
	private ensureNotDisposed(): void {
		if (this.disposed) {
			throw new Error(
				"Storage instance has been closed and cannot be used.",
			);
		}
	}
}
