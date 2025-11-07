import { load, Store, StoreOptions } from "@tauri-apps/plugin-store";

export class Storage {
	private store: Store;
	private data: Record<string, any> = {};
	private isListMode = false;

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

		if (entries.length === 1 && entries[0][0] === "__root__") {
			this.isListMode = true;
			this.data["__root__"] = entries[0][1] ?? [];
		} else {
			for (const [k, v] of entries) {
				this.data[k] = v;
			}
		}
	}

	// ------------------------------

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

	// ------------------------------

	list<T = any>(): T[] {
		if (!this.isListMode) {
			throw new Error(
				"list() only available in list-based stores (__root__).",
			);
		}
		return this.data["__root__"];
	}

	push<T = any>(item: T): void {
		if (!this.isListMode) {
			throw new Error(
				"push() only available in list-based stores (__root__).",
			);
		}
		this.data["__root__"].push(item);
		this.persistRoot();
	}

	removeAt(index: number): void {
		if (!this.isListMode) {
			throw new Error(
				"removeAt() only available in list-based stores (__root__).",
			);
		}
		const arr = this.data["__root__"];
		if (index < 0 || index >= arr.length) return;
		arr.splice(index, 1);
		this.persistRoot();
	}

	updateAt<T = any>(index: number, newValue: T): void {
		if (!this.isListMode) {
			throw new Error(
				"updateAt() only available in list-based stores (__root__).",
			);
		}
		const arr = this.data["__root__"];
		if (index < 0 || index >= arr.length) return;
		arr[index] = newValue;
		this.persistRoot();
	}

	find<T = any>(
		predicate: (item: T, index: number) => boolean,
	): T | undefined {
		if (!this.isListMode) {
			throw new Error(
				"find() only available in list-based stores (__root__).",
			);
		}
		return this.data["__root__"].find(predicate);
	}

	setList<T = any>(newList: T[]): void {
		if (!this.isListMode) {
			throw new Error(
				"setList() only available in list-based stores (__root__).",
			);
		}
		this.data["__root__"] = newList;
		this.persistRoot();
	}

	clearList(): void {
		if (!this.isListMode) {
			throw new Error(
				"clearList() only available in list-based stores (__root__).",
			);
		}
		this.data["__root__"] = [];
		this.persistRoot();
	}

	private persistRoot() {
		this.store.set("__root__", this.data["__root__"]).catch((e) => {
			console.error("Failed to persist __root__", e);
		});
	}
}
