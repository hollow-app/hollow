import { HollowEvent } from "@type/hollow";
import { listeners } from "process";

export class EventsManager<
	EventMap extends Record<string, any> = Record<string, any>,
	ReturnMap extends { [K in keyof EventMap]?: any } = {
		[K in keyof EventMap]: void;
	},
> implements HollowEvent<EventMap, ReturnMap>
{
	private listeners: {
		[K in keyof EventMap]?: ((data: EventMap[K]) => ReturnMap[K] | void)[];
	} = {};
	private currentData: Partial<EventMap> = {};
	private wildcard = new Set<Function>();

	// On will return a callback related to what it got from the emit.
	on<K extends keyof EventMap>(
		eventName: K,
		listener: (data: EventMap[K]) => ReturnMap[K] | void,
	): void {
		if (eventName === "*") {
			this.wildcard.add(listener);
			return;
		}
		if (!this.listeners[eventName]) this.listeners[eventName] = [];
		if (!this.listeners[eventName]!.includes(listener)) {
			this.listeners[eventName]!.push(listener);
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
		if (!this.listeners[eventName]) return;
		this.listeners[eventName] = this.listeners[eventName]!.filter(
			(l) => l !== listener,
		);
		if (this.listeners[eventName]!.length === 0) {
			delete this.listeners[eventName];
		}
	}

	emit<K extends keyof EventMap>(
		eventName: K,
		data: EventMap[K],
	): ReturnMap[K] | undefined {
		this.currentData[eventName] = data;
		this.wildcard.forEach((fn) => fn({ event: eventName, data }));
		const eventListeners = this.listeners[eventName];
		if (!eventListeners) return undefined;

		for (const listener of eventListeners) {
			const result = listener(data);
			if (result !== undefined && result !== null) {
				return result as ReturnMap[K];
			}
		}
		return undefined;
	}

	// will return a callback.
	getCurrentData<K extends keyof EventMap>(
		eventName: K,
	): EventMap[K] | undefined {
		return this.currentData[eventName];
	}

	clear<K extends keyof EventMap>(eventName: K): void {
		delete this.listeners[eventName];
	}

	toggle<K extends keyof EventMap>(eventName: K): void {
		const eventListeners = this.listeners[eventName];
		if (eventListeners) {
			const data = !this.currentData[eventName] as EventMap[K];
			this.currentData[eventName] = data;
			eventListeners.forEach((listener) => listener(data));
		}
	}
}
