type KeyListener<T, K extends keyof T> = (value: T[K], key: K) => void;
type GlobalListener<T> = (value: T) => void;

type GlobalSubscribeOptions = {
	key?: never;
	now?: boolean;
	once?: boolean;
};

type KeySubscribeOptions<K extends PropertyKey> = {
	key: K;
	now?: boolean;
	once?: boolean;
};

type SubscribeOptions<T> =
	| GlobalSubscribeOptions
	| { [K in keyof T]: KeySubscribeOptions<K> }[keyof T];

export class ReactiveManager<T extends object> {
	protected value: T;
	private keyListeners: Map<keyof T, Set<KeyListener<T, keyof T>>> =
		new Map();
	private globalListeners: Set<GlobalListener<T>> = new Set();

	constructor(initialValue: T) {
		this.value = initialValue;
	}

	subscribe(
		listener: GlobalListener<T>,
		options?: GlobalSubscribeOptions,
	): () => void;

	subscribe<K extends keyof T>(
		listener: KeyListener<T, K>,
		options: KeySubscribeOptions<K>,
	): () => void;

	subscribe(
		listener: GlobalListener<T> | KeyListener<T, any>,
		options?: SubscribeOptions<T>,
	): () => void {
		const isOnce = !!options?.once;
		const shouldRunNow = !isOnce && !!options?.now;

		let unsubscribe: () => void = () => {};

		if (!options || !("key" in options)) {
			const originalFn = listener as GlobalListener<T>;

			const wrappedFn: GlobalListener<T> = (val) => {
				originalFn(val);
				if (isOnce) unsubscribe();
			};

			this.globalListeners.add(wrappedFn);
			if (shouldRunNow) wrappedFn(this.value);

			unsubscribe = () => this.globalListeners.delete(wrappedFn);
			return unsubscribe;
		} else {
			const { key } = options;
			const originalFn = listener as KeyListener<T, typeof key>;

			if (!this.keyListeners.has(key)) {
				this.keyListeners.set(key, new Set());
			}

			const set = this.keyListeners.get(key)!;

			const wrappedFn: KeyListener<T, typeof key> = (val, k) => {
				originalFn(val, k);
				if (isOnce) unsubscribe();
			};

			set.add(wrappedFn as KeyListener<T, keyof T>);
			if (shouldRunNow) wrappedFn(this.value[key], key);

			unsubscribe = () =>
				set.delete(wrappedFn as KeyListener<T, keyof T>);
			return unsubscribe;
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
