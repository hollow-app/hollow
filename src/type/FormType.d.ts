import { BaseOption, TypedOptionMap } from "./OptionTypes";

export type FormOption = {
	key: any;
	dependsOn?: { key: string; conditions: any[] };
	value?: any;
} & {
	[K in keyof TypedOptionMap]: BaseOption<K, TypedOptionMap[K]>;
}[keyof TypedOptionMap];

export type FormType = {
	id: string;
	title: string;
	// hollow-api
	description?;
	submit: (submission: any) => void;
	options: FormOption[];
	update?: boolean;
};
