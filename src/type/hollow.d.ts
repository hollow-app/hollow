// Represents a plugin with lifecycle methods that interact with cards and the app.
export interface IPlugin {
	/**
	 * Called when a card is created.
	 * @param name - The name of the card being created.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	onCreate(card: ICard): Promise<boolean>;

	/**
	 * Called when a card is deleted.
	 * @param name - The name of the card being deleted.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	onDelete(card: ICard): Promise<boolean>;

	/**
	 * Called when a card is loaded.
	 * @param card - The card object being loaded.
	 * @param app - The HollowEvent instance for interacting with the app.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	onLoad(card: ICard): Promise<boolean>;

	/**
	 * Called when a card is unloaded.
	 * @param name - The name of the card being unloaded.
	 * Cleans up resources or state as necessary.
	 */
	onUnload(name: string): void;
}

// Represents a card in the app, with properties and methods for interaction.
export type ICard = {
	/**
	 * The HollowEvent instance of the whole app.
	 */
	app: HollowEvent<AppEvents>;

	/**
	 * The HollowEvent instance for cards of the same tool to interacting with each other.
	 */
	toolEvent: HollowEvent<ToolEvents>;
} & Omit<CardType, "kit">;

// A type representing an event listener callback.
type Listener<T> = (data?: T) => void;

/**
 * Represents a generic, type-safe event system for the app.
 * Each instance of HollowEvent can have its own set of predefined events with specific payload types.
 * If no EventMap is provided, all event names are allowed and payloads can be any type.
 */
export type HollowEvent<
	EventMap extends Record<string, any> = Record<string, any>,
> = {
	/**
	 * Registers a listener for a specific event.
	 * @param eventName - The name of the event.
	 * @param listener - The callback to invoke when the event is emitted.
	 */
	on<K extends keyof EventMap>(
		eventName: K,
		listener: (data: EventMap[K]) => void,
	): void;

	/**
	 * Unregisters a listener for a specific event.
	 * @param eventName - The name of the event.
	 * @param listener - The callback to remove.
	 */
	off<K extends keyof EventMap>(
		eventName: K,
		listener: (data: EventMap[K]) => void,
	): void;

	/**
	 * Emits an event, optionally passing data to the listeners.
	 * @param eventName - The name of the event.
	 * @param data - The data to pass to the listeners.
	 */
	emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): void;

	/**
	 * Retrieves the current data for a specific event.
	 * @param eventName - The name of the event.
	 * @returns The current data associated with the event, or undefined.
	 */
	getCurrentData<K extends keyof EventMap>(
		eventName: K,
	): EventMap[K] | undefined;

	/**
	 * Clears all listeners for a specific event.
	 * @param eventName - The name of the event to clear.
	 */
	clear<K extends keyof EventMap>(eventName: K): void;

	/**
	 * Toggles the boolean state of an event.
	 * This is intended for events that store a boolean value, switching it between `true` and `false`.
	 * If the event does not store a boolean, this method will have no effect.
	 * @param eventName - The name of the event whose boolean state is to be toggled.
	 */
	toggle<K extends keyof EventMap>(eventName: K): void;
};

export type AppEvents = {
	form: FormType;
	confirm: ConfirmType;
	"tool-settings": ToolOptions;
	"color-picker": { color: string; setColor: (c: string) => void };
	"emoji-picker": { emoji: string; setEmoji: (c: string) => void };
	"show-vault": { onSelect?: (url: string) => void };
	"context-menu-extend": ContextMenuItem;
	database: DataBaseRequest;
	"character-add-achievement": string;
	"character-add-xp": number;
	notify: NotifyType;
	insight: InsightType;
} & {
	[key: string]: any;
};

export type ToolEvents = {
	metadata: { cards: CardType[] };
} & {
	[key: string]: any;
};

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
	icon?: string;

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
	expires_at: string;

	/**
	 * Category or type label.
	 */
	type: "achievement" | "reminder" | "error" | "info" | "warning" | "update";

	/**
	 * @ignore
	 */
	visible?: boolean;
};

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

export type EntryType = {
	/**
	 * Unique identifier for this data entry (within the tool).
	 */
	id: string;

	/**
	 * The tool and its corresponding card that hosts this data.
	 */
	source: {
		tool: string;
		card: string;
		icon?: string;
	};

	/**
	 * Optional human-readable title or label.
	 */
	title?: string;

	/**
	 * The primary content or body of the data.
	 * Used as the main value in Radarite.
	 */
	content?: string;

	/**
	 * Tags used for categorization or filtering across tools.
	 */
	tags?: string[];

	/**
	 * Timestamp for sorting or display purposes.
	 */
	createdAt?: string; // ISO 8601 format

	/**
	 * Last modified timestamp.
	 */
	modifiedAt?: string; // ISO 8601 format

	/**
	 * Optional metadata specific to the tool or context.
	 */
	meta?: Record<string, any>;

	/**
	 * Optional type descriptor for this entry (e.g., 'note', 'task', 'event').
	 */
	type?: string;

	/**
	 * Whether this entry is archived or inactive.
	 */
	archived?: boolean;

	/**
	 * Whether this entry is specially marked/pinned.
	 */
	pinned?: boolean;

	/**
	 * Optional normalized importance value (0 to 1).
	 */
	importance?: number;

	/**
	 * Optional usage or interaction frequency value.
	 */
	frequency?: number;

	/**
	 * Scoreboard of standardized numeric values (tool-defined).
	 * Useful for Radarite or analytics tools.
	 */
	scoreboard?: Record<string, number>;

	/**
	 * Optional key to group this under a specific radar group.
	 * Radarite can use this to auto-suggest metric groups.
	 */
	customRadarKey?: string;
};

/**
 * A map of all supported input types and their configuration options.
 * These are used for both tool settings and form entries.
 */
export type TypedOptionMap = {
	text: { placeholder?: string; pattern?: string };
	longtext: { placeholder?: string };
	number: { min?: number; max?: number };
	boolean: {};
	button: {};
	color: {};
	emoji: {};
	dropdown: { options: string[] };
	file: { accept?: string };
	image: {};
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
	onChange: (v: any) => void;
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
export type ToolOption =
	| (ToolOptionBase &
			{
				[K in keyof TypedOptionMap]: BaseOption<K, TypedOptionMap[K]>;
			}[keyof TypedOptionMap])
	| {
			type: "custom";

			/**
			 * Render function for fully custom settings components.
			 */
			render: () => JSX.Element;
	  };

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
 * Defines the structure for a Card Kit configuration.
 */
export type KitType = {
	/** Width of the kit (in units not pixels). */
	width: number;

	/** Height of the kit (in units not pixels). */
	height: number;

	/** Corner radius for rounded edges. */
	corner: number;

	/** Opacity level (0 = transparent, 1 = fully opaque). */
	opacity: number;

	/** Border settings. */
	border: {
		/** Border color (CSS color string). */
		c: string;

		/** Border thickness (in pixels). */
		n: number;
	};

	/** Whether the kit has a glass-like appearance. */
	glass: boolean;

	/** Whether the kit includes a shadow effect. */
	shadow: boolean;

	/** 3D position inside the canvas. */
	xyz: {
		/** Horizontal position or offset. */
		x: number;

		/** Vertical position or offset. */
		y: number;

		/** Depth or z-index position. */
		z: number;
	};

	/**
	 * Optional extra styling or configuration.
	 * Can include any valid CSS properties.
	 */
	extra?: {
		/** Outer margin for spacing. */
		outerMargin: string;
	} & JSX.CSSProperties;
};

/**
 * Represents information about a card.
 */
export type CardType = {
	/** Unique identifier */
	id: string;

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

	/** Configuration of the card's kit. */
	kit: KitType;
};

export type ConfirmType = {
	type: string;
	message: string;
	onAccept: () => void;
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
