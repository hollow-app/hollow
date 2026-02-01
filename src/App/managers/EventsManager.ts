import { HollowEvent } from "@app/type/hollow";

type ListenerEntry<Data, Ret> = {
	fn: (data: Data) => Ret | void;
	source?: string;
};

export class EventsManager<
	EventMap extends Record<string, any> = Record<string, any>,
	ReturnMap extends { [K in keyof EventMap]?: any } = {
		[K in keyof EventMap]: void;
	},
> implements HollowEvent<EventMap, ReturnMap>
{
	private listeners: {
		[K in keyof EventMap]?: ListenerEntry<EventMap[K], ReturnMap[K]>[];
	} = {};

	private currentData: Partial<EventMap> = {};
	private wildcard = new Set<Function>();

	// On will return a callback related to what it got from the emit.
	on<K extends keyof EventMap>(
		eventName: K,
		listener: (data: EventMap[K]) => ReturnMap[K] | void,
		options?: { source?: string },
	): void {
		if (eventName === "*") {
			this.wildcard.add(listener);
			return;
		}

		if (!this.listeners[eventName]) {
			this.listeners[eventName] = [];
		}

		const exists = this.listeners[eventName]!.some(
			(l) => l.fn === listener,
		);

		if (!exists) {
			this.listeners[eventName]!.push({
				fn: listener,
				source: options?.source,
			});
		}
	}

	off<K extends keyof EventMap>(
		eventName: K,
		listener: (data: EventMap[K]) => ReturnMap[K] | void,
	): void {
		if (eventName === "*") {
			this.wildcard.delete(listener);
			return;
		}

		const list = this.listeners[eventName];
		if (!list) return;

		this.listeners[eventName] = list.filter((l) => l.fn !== listener);

		if (this.listeners[eventName]!.length === 0) {
			delete this.listeners[eventName];
		}
	}

	emit<K extends keyof EventMap>(
		eventName: K,
		data: EventMap[K] | undefined,
		options: { source: string },
	): ReturnMap[K];

	emit<K extends keyof EventMap>(
		eventName: K,
		data?: EventMap[K],
		options?: { source?: undefined },
	): ReturnMap[K][];

	emit<K extends keyof EventMap>(
		eventName: K,
		data?: EventMap[K],
		options?: { source?: string },
	): ReturnMap[K] | ReturnMap[K][] {
		this.currentData[eventName] = data;

		this.wildcard.forEach((fn) => fn({ event: eventName, data }));

		const eventListeners = this.listeners[eventName];
		if (!eventListeners) {
			return options?.source ? undefined : [];
		}

		// SOURCE-SPECIFIC EMIT
		if (options?.source) {
			const match = eventListeners.find(
				(l) => l.source === options.source,
			);

			if (!match) return undefined as ReturnMap[K];

			return match.fn(data) as ReturnMap[K];
		}

		// NORMAL EMIT (COLLECT ALL)
		const results: ReturnMap[K][] = [];

		for (const { fn } of eventListeners) {
			const result = fn(data);
			if (result !== undefined && result !== null) {
				results.push(result as ReturnMap[K]);
			}
		}

		return results;
	}

	async emitAsync<K extends keyof EventMap>(
		eventName: K,
		data?: EventMap[K],
		options?: { source: string },
	): Promise<ReturnMap[K]>;
	async emitAsync<K extends keyof EventMap>(
		eventName: K,
		data?: EventMap[K],
		options?: { source?: string },
	): Promise<ReturnMap[K] | ReturnMap[K][]> {
		this.currentData[eventName] = data;

		await Promise.all(
			Array.from(this.wildcard).map((fn) =>
				fn({ event: eventName, data }),
			),
		);

		const eventListeners = this.listeners[eventName];
		if (!eventListeners) {
			return options?.source ? undefined : [];
		}
		if (options?.source) {
			const match = eventListeners.find(
				(l) => l.source === options.source,
			);
			if (!match) return undefined;
			return (await match.fn(data)) as Promise<ReturnMap[K]>;
		}
		const results: ReturnMap[K][] = [];

		for (const { fn } of eventListeners) {
			const result = await fn(data);
			if (result !== undefined && result !== null) {
				results.push(result as ReturnMap[K]);
			}
		}

		return results;
	}

	getData<K extends keyof EventMap>(eventName: K): EventMap[K] | undefined {
		return this.currentData[eventName];
	}

	clear<K extends keyof EventMap>(eventName: K): void {
		delete this.listeners[eventName];
	}

	toggle<K extends keyof EventMap>(eventName: K): void {
		//@ts-ignore
		const data: EventMap[K] = !this.getData(eventName);

		this.currentData[eventName] = data;

		this.wildcard.forEach((fn) => fn({ event: eventName, data }));

		const eventListeners = this.listeners[eventName];
		if (eventListeners) {
			eventListeners.forEach(({ fn }) => fn(data));
		}
	}
}
