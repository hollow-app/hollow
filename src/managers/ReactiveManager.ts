type KeyListener<T, K extends keyof T> = (value: T[K], key: K) => void;
type GlobalListener<T> = (value: T) => void;

export class ReactiveManager<T extends object> {
	private value: T;
	private keyListeners: Map<keyof T, Set<KeyListener<T, keyof T>>> =
		new Map();
	private globalListeners: Set<GlobalListener<T>> = new Set();

	constructor(initialValue: T) {
		this.value = initialValue;
	}

	subscribe(listener: GlobalListener<T>): () => void;

	subscribe<K extends keyof T>(
		listener: KeyListener<T, K>,
		key: K,
	): () => void;

	subscribe(listener: any, key?: keyof T): () => void {
		if (key === undefined) {
			this.globalListeners.add(listener);
			listener(this.value);
			return () => this.globalListeners.delete(listener);
		} else {
			if (!this.keyListeners.has(key)) {
				this.keyListeners.set(key, new Set());
			}
			this.keyListeners.get(key)!.add(listener);
			listener(this.value[key], key);
			return () => this.keyListeners.get(key)!.delete(listener);
		}
	}

	set set(newValue: Partial<T> | T) {
		const updatedKeys: (keyof T)[] = [];
		for (const k in newValue) {
			const newVal = newValue[k as keyof T] as T[keyof T];
			if (this.value[k as keyof T] !== newVal) {
				this.value[k as keyof T] = newVal;
				updatedKeys.push(k as keyof T);
			}
		}
		this.emit(updatedKeys);
	}

	get get(): T {
		return this.value;
	}

	private emit(updatedKeys: (keyof T)[]) {
		for (const key of updatedKeys) {
			const listeners = this.keyListeners.get(key);
			if (listeners) {
				for (const listener of listeners) {
					listener(this.value[key], key);
				}
			}
		}
		for (const listener of this.globalListeners) {
			listener(this.value);
		}
	}
}
