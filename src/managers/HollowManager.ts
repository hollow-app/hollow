import { HollowEvent } from "hollow-api";

type Listener<T> = (data?: T) => void;

export class HollowManager implements HollowEvent {
	private listeners: { [eventName: string]: Listener<any>[] } = {};
	private currentData: { [eventName: string]: any } = {};

	// register a listener for a specific event
	on<T>(eventName: string, listener: Listener<T>): void {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = [];
		}
		if (!this.listeners[eventName].includes(listener)) {
			this.listeners[eventName].push(listener);
		}
	}

	// unregister a lis'ener for a specific event
	off<T>(eventName: string, listener: Listener<T>): void {
		if (!this.listeners[eventName]) return;
		this.listeners[eventName] = this.listeners[eventName].filter(
			(l) => l !== listener,
		);
	}

	// emit an event with data, notifying all listeners
	emit<T>(eventName: string, data?: T): void {
		this.currentData[eventName] = data;
		const eventListeners = this.listeners[eventName];
		if (eventListeners) {
			eventListeners.forEach((listener) => listener(data));
		}
	}

	// Get the listeners for a specific event.
	getCurrentData<T>(eventName: string): T | undefined {
		return this.currentData[eventName];
	}

	clear(eventName: string): void {
		if (!this.listeners[eventName]) return;
		this.listeners[eventName] = null;
	}

	toggle(eventName: string): void {
		const eventListeners = this.listeners[eventName];
		if (eventListeners) {
			const data = !this.currentData[eventName];
			this.currentData[eventName] = data;
			eventListeners.forEach((listener) => listener(data));
		}
	}
}
