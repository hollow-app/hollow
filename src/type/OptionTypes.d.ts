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
	range: { min: number; max: number; step?: number };
	keywords: { placeholder?: string };
};

export type BaseOption<T extends string, Extra = {}> = {
	type: T;
	label: string;
	description?: string;
	optional?: boolean;
} & Extra;
