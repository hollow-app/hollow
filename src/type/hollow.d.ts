import { MyIconsType } from "@components/MyIcon";
import { Store } from "@tauri-apps/plugin-store";
import { Component, JSX } from "solid-js";

export interface PluginResult {
	status: boolean;
	message?: string;
	error?: Error;
	data?: unknown;
}

// Represents a plugin with lifecycle methods that interact with cards and the app.
export interface IPlugin {
	/**
	 * Called when a card is created.
	 * @param name - The name of the card being created.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	onCreate(card: CardType): Promise<PluginResult>;

	/**
	 * Called when a card is deleted.
	 * @param name - The name of the card being deleted.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	onDelete(card: CardType): Promise<PluginResult>;

	/**
	 * Called when a card is loaded.
	 * @param card - The card object being loaded.
	 * @param app - The HollowEvent instance for interacting with the app.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	onLoad(card: CardType): Promise<PluginResult>;

	/**
	 * Called when a card is unloaded.
	 * @param id - The id of the card being unloaded.
	 * Cleans up resources or state as necessary.
	 */
	onUnload(id: string): Promise<PluginResult>;
}

// Represents a card in the app, with properties and methods for interaction.
// export type ICard = {
// 	/**
// 	 * The HollowEvent instance of the whole app.
// 	 */
// 	app: HollowEvent<AppEvents, AppEventReturns>;
//
// 	/**
// 	 * The HollowEvent instance for cards of the same tool to interacting with each other.
// 	 */
// 	toolEvent: HollowEvent<ToolEvents, ToolEventReturns>;
// } & Omit<CardType, "kit">;

// A type representing an event listener callback.
type Listener<T> = (data?: T) => void;

/**
 * Represents a generic, type-safe event system for the app.
 * Each instance of HollowEvent can have its own set of predefined events with specific payload and return types.
 * If no EventMap is provided, all event names are allowed and payloads/returns can be any type.
 *
 * @template EventMap - mapping of event name -> payload type
 * @template ReturnMap - mapping of event name -> return type for listeners (defaults to `void` for every event)
 */
export type HollowEvent<
	EventMap extends Record<string, any> = Record<string, any>,
	ReturnMap extends Record<keyof EventMap, any> = {
		[K in keyof EventMap]: void;
	},
> = {
	/**
	 * Registers a listener for a specific event.
	 * The listener can optionally return a value (e.g., a callback function).
	 *
	 * @param eventName - The name of the event.
	 * @param listener - The callback to invoke when the event is emitted.
	 */
	on<K extends keyof EventMap>(
		eventName: K,
		listener: (data: EventMap[K]) => ReturnMap[K] | void,
	): void;

	/**
	 * Unregisters a listener for a specific event.
	 *
	 * @param eventName - The name of the event.
	 * @param listener - The callback to remove.
	 */
	off<K extends keyof EventMap>(
		eventName: K,
		listener: (data: EventMap[K]) => ReturnMap[K] | void,
	): void;

	/**
	 * Emits an event, optionally passing data to the listeners.
	 * If a listener returns a non-null/undefined value, that value is returned (first one wins).
	 *
	 * @param eventName - The name of the event.
	 * @param data - The data to pass to the listeners.
	 * @returns The first non-null/undefined value returned by a listener, or undefined.
	 */
	emit<K extends keyof EventMap>(
		eventName: K,
		data: EventMap[K],
	): ReturnMap[K] | undefined;

	/**
	 * Retrieves the current data for a specific event.
	 *
	 * @param eventName - The name of the event.
	 * @returns The current data associated with the event, or undefined.
	 */
	getData<K extends keyof EventMap>(eventName: K): EventMap[K] | undefined;

	/**
	 * Clears all listeners for a specific event.
	 *
	 * @param eventName - The name of the event to clear.
	 */
	clear<K extends keyof EventMap>(eventName: K): void;

	/**
	 * Toggles the boolean state of an event.
	 * This is intended for events that store a boolean value, switching it between `true` and `false`.
	 * If the event does not store a boolean, this method will have no effect.
	 *
	 * @param eventName - The name of the event whose boolean state is to be toggled.
	 */
	toggle<K extends keyof EventMap>(eventName: K): void;
};

export type AppEvents = {
	form: FormType;
	confirm: ConfirmType;
	"tool-settings": ToolOptions;
	"color-picker": { color: string; setColor: (c: string) => void };
	"date-picker": { options: any; onSave: () => void };
	"emoji-picker": { emoji: string; setEmoji: (c: string) => void };
	"show-vault": { onSelect?: (url: string) => void };
	"context-menu-extend": ContextMenuItem;
	database: DataBaseRequest;
	"character-add-achievement": string;
	"character-add-xp": number;
	notify: NotifyType;
	insight: InsightType;
	"network-state": boolean;
	alert: AlertType;
	store: (props: StoreType) => Promise<IStore>;
	"add-layout": (props: {
		type: "left" | "right";
		id: string;
		mount: (el: HTMLDivElement) => { unmount: () => void };
		icon: any;
		tooltip?: string;
	}) => {
		isOpen: () => boolean;
		close: () => void;
	};
} & {
	[key: string]: any;
};
export type AppEventReturns = {
	alert: (() => void) | null;
} & {
	[key: string]: any;
};

export type ToolEvents = {
	metadata: { cards: CardType[] };
	store: IStore;
	"card-fs": { cardName: string };
	"get-store": { cardName: string; store: StoreType };
} & {
	[key: string]: any;
};

export type ToolEventReturns = {
	"get-store": () => Promise<IStore>;
	"card-fs": CardFs;
} & {
	[key: string]: any;
};

export type AppApi = HollowEvent<AppEvents, AppEventReturns>;
export type ToolApi = HollowEvent<ToolEvents, ToolEventReturns>;

/**
 * Represents an advanced IndexedDB-like database interface.
 * Supports multiple object stores, indexed queries, and management utilities.
 */
export interface DataBase {
	/**
	 * Stores or updates data in a specific store.
	 * @param storeName - The name of the object store.
	 * @param key - The key for the data.
	 * @param value - The value to store.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	putData<T>(storeName: string, key: string, value: T): Promise<boolean>;

	/**
	 * Retrieves data by key from a specific store.
	 * @param storeName - The name of the object store.
	 * @param key - The key for the data to retrieve.
	 * @returns A promise that resolves to the data or undefined if not found.
	 */
	getData<T>(storeName: string, key: string): Promise<T | undefined>;

	/**
	 * Deletes data from a specific store.
	 * @param storeName - The name of the object store.
	 * @param key - The key for the data to delete.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	deleteData(storeName: string, key: string): Promise<boolean>;

	/**
	 * Retrieves all data entries from a specific store.
	 * @param storeName - The name of the object store.
	 * @returns A promise that resolves to an array of all stored data.
	 */
	getAllData<T>(storeName: string): Promise<T[]>;

	/**
	 * Clears all data from a specific store.
	 * @param storeName - The name of the object store to clear.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	clearStore(storeName: string): Promise<boolean>;

	/**
	 * Deletes the entire database and all its stores.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	deleteDatabase(): Promise<boolean>;
	/**
	 *
	 */
	getDBInstance(): Promise<IDBDatabase>;
}
export type DataBaseRequest = {
	pluginName: string;
	version?: number;
	stores?: StoreSchema[];
	callback: (db: DataBase) => void;
};
/*
 * Represents a group of context menu buttons emitted to Hollow's context menu.
 * This allows extending the menu with custom functionality based on the item triggered.
 */
export type ContextMenuItem = {
	/**
	 * A unique identifier for the context menu group.
	 */
	id: string;

	/**
	 * The group title displayed above the list of menu items.
	 */
	header: string;

	/**
	 * An array of buttons to be displayed in the context menu under this group.
	 */
	items: ContextMenuItemButton[];
};

export type ContextMenuItemButton = {
	/**
	 * The name of the icon from lucide.dev in PascalCase format.
	 */
	icon?: any;

	/**
	 * The text label displayed on the button.
	 */
	label: string;

	/**
	 * Function to be called when the button is clicked.
	 * Should not be provided if `children` are defined.
	 */
	onclick?: () => void;

	/**
	 * A submenu of buttons that appears when this button is hovered over.
	 */
	children?: Omit<ContextMenuItemButton, "children">[];
};

/**
 * Represents a notification that can be displayed in Hollow.
 */
export type NotifyType = {
	/**
	 * A unique identifier for the notification.
	 */
	id: string;

	/**
	 * Title of the notification.
	 */
	title: string;

	/**
	 * Main message content of the notification.
	 */
	message: string;

	/**
	 * Optional attachment URL or identifier.
	 */
	attachment?: string;

	/**
	 * ISO timestamp of when the notification was submitted.
	 */
	submitted_at: string;

	/**
	 * ISO timestamp of when the notification should expire.
	 */
	expires_at?: string;
};

export type AlertType =
	| {
			type?: "success" | "error" | "warning" | "info";
			title?: string;
			message: string;
			button?: {
				label: string;
				callback: () => void;
			};
			onTimeOut?: () => void;
			duration?: number; //ms
	  }
	| { type: "loading"; title?: string; message: string };
/**
 * Represents a visual tag with a name and color scheme.
 */
export type TagType = {
	/**
	 * Name of the tag.
	 */
	name: string;

	/**
	 * Text color.
	 */
	foreground: string;

	/**
	 * Background color.
	 */
	background: string;
};

/**
 * A map of all supported input types and their configuration options.
 * These are used for both tool settings and form entries.
 */
export type TypedOptionMap = {
	// native
	text: { attributes?: JSX.InputHTMLAttributes<HTMLInputElement> };
	// native
	longtext: { attributes?: JSX.TextAreaHTMLAttributes<HTMLTextAreaElement> };
	number: { min?: number; max?: number };
	boolean: {};
	segmented: { options: { title?: string; key: any; icon?: any }[] };
	// ??
	button: {};
	color: {};
	emoji: {};
	dropdown: {
		options: { title?: string; items: string[] }[];
		placeholder?: string;
	};
	custom: {
		render: (
			el: HTMLDivElement,
			option: { value: any; onAction: (v?: any) => void },
		) => { cleanup: () => void };
	};
	// ??
	file: {};
	range: { min: number; max: number; step?: number };
	keywords: { placeholder?: string };
};
/**
 * Base configuration shared across all option types.
 *
 * @template T  The string key of the input type (from TypedOptionMap).
 * @template Extra  The additional config for that input type.
 */
export type BaseOption<T extends string, Extra = {}> = {
	type: T;
	label: string;
	description?: string;
	optional?: boolean;
} & Extra;

type ToolOptionBase = {
	/**
	 * Current value of the setting.
	 */
	value: any;

	/**
	 * Called whenever the setting value changes.
	 */
	onAction: (v?: any) => void;
};

/**
 * The full object a tool submits when requesting its settings to be rendered in Hollow.
 */
export type ToolOptions = {
	/**
	 * Tool name that is requesting settings rendering.
	 */
	tool: string;

	/**
	 * Card name the settings are linked to.
	 */
	card: string;

	/**
	 * Called to persist/save any changes made to the settings.
	 */
	save: () => void;

	/**
	 * List of editable options or settings.
	 */
	options: ToolOption[];
};

/**
 * Represents a setting option submitted by a tool to be displayed
 * and edited in Hollow’s settings system.
 *
 * Tools can use predefined field types (from TypedOptionMap), or render
 * a completely custom element.
 */
export type ToolOption = ToolOptionBase &
	{
		[K in keyof TypedOptionMap]: BaseOption<K, TypedOptionMap[K]>;
	}[keyof TypedOptionMap];

/**
 * Represents a form submission request
 */
export type FormType = {
	/**
	 * Unique ID for the form instance.
	 */
	id: string;

	/**
	 * Title displayed at the top of the form.
	 */
	title: string;

	/**
	 * Description displayed for this form.
	 */
	description?: string;
	/**
	 * Callback triggered with the full form values once submitted.
	 */
	submit: (submission: any) => void;

	/**
	 * List of input fields the user can interact with.
	 */
	options: FormOption[];

	/**
	 * Optional: if true, the form is used to update existing data rather than create new data.
	 */
	update?: boolean;
};

/**
 * A single input field in a form, used when a tool requests a user to fill in information.
 */
export type FormOption = {
	/**
	 * Unique key identifying the option within the form submission.
	 */
	key: any;
	inline?: boolean;
	row?: boolean;
	/**
	 * Conditional visibility:
	 * This field will only be shown if the option with the matching key
	 * has one of the values listed in `conditions`.
	 */
	dependsOn?: { key: string; conditions: any[] };

	/**
	 * Pre-filled value.
	 */
	value?: any;
} & {
	[K in keyof TypedOptionMap]: BaseOption<K, TypedOptionMap[K]>;
}[keyof TypedOptionMap];

/**
 * Represents information about a card.
 */
export type CardType = {
	/** Unique identifier */
	id: string;
	x?: number;
	y?: number;
	w: number;
	h: number;
	class?: string;
	style?: JSX.CSSProperties;
	data: {
		/** Name of the card. */
		name: string;

		/** Emoji associated with the card. */
		emoji: string;

		/** Whether the card is placed. */
		isPlaced: boolean;

		/** Whether the card is marked as favored. */
		isFavored: boolean;

		/** Date when the card was created (ISO string). */
		CreatedDate: string;

		[key: string]: any;
	};
};

export type ConfirmType = {
	title: string;
	message: string;
	onAccept: () => void;
	onRefuse?: () => void;
	accLabel?: string;
	refLabel?: string;
};

export type InsightType = {
	title: string;
	message?: string;
	items?: {
		label: string;
		value?: string | number;
		tooltip?: string;
	}[];
	source?: {
		tool: string;
		card: string;
	};
};

export type StoreType = {
	path: string;
	options?: {
		defaults: {
			[key: string]: unknown;
		};
		autoSave?: boolean | number;
		serializeFnName?: string;
		deserializeFnName?: string;
		createNew?: boolean;
		overrideDefaults?: boolean;
	};
};

export interface IStore {
	/**
	 * Returns the in-memory data object.
	 * Throws if the storage has been closed.
	 */
	getData(): Record<string, any>;

	/**
	 * Gets a value from the in-memory cache.
	 * Throws if the storage has been closed.
	 */
	get<T>(key: string, defaultValue?: T): T | undefined;

	/**
	 * Sets a value and persists it asynchronously.
	 * Throws if the storage has been closed.
	 */
	set(key: string, value: any): void;

	/**
	 * Sets multiple values and persists them asynchronously.
	 * Throws if the storage has been closed.
	 */
	setMany(values: Record<string, any>): void;

	/**
	 * Removes a key from storage.
	 * Throws if the storage has been closed.
	 */
	remove(key: string): void;

	/**
	 * Returns all keys in the in-memory cache.
	 * Throws if the storage has been closed.
	 */
	keys(): string[];

	/**
	 * Explicitly saves pending changes to disk.
	 * Throws if the storage has been closed.
	 */
	save(): Promise<void>;

	/**
	 * Reloads the store from disk and refreshes in-memory cache.
	 * Throws if the storage has been closed.
	 */
	reload(): Promise<void>;

	/**
	 * Disposes the underlying store resource.
	 * After calling this, the instance must not be used.
	 * This method is idempotent.
	 */
	close(): Promise<void>;
}

export type CardFs = {
	exists(path: string): Promise<boolean>;
	readFile(path: string): Promise<string>;
	writeFile(path: string, contents: string): Promise<void>;
	mkdir(path: string): Promise<void>;
	readDir(path?: string): Promise<DirEntry[]>;
	remove(path: string): Promise<void>;
	rename(path: string, newPath: string): Promise<void>;
};
