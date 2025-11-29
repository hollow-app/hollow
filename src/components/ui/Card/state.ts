import { Accessor, createSignal, Setter } from "solid-js";
import { CardProps } from ".";
import type { HelperType } from "./helper";

export type StateType = {
	vault: HTMLDivElement;
	isLoaded: Accessor<boolean>;
	setLoaded: Setter<boolean>;
	isExpand: Accessor<boolean>;
	setExpand: Setter<boolean>;
};

export const createCardState = (
	props: CardProps,
	helper?: HelperType,
): StateType => {
	let vault!: HTMLDivElement;
	const [isLoaded, setLoaded] = createSignal(false);
	const [isExpand, setExpand] = createSignal(false);
	return { vault, isLoaded, setLoaded, isExpand, setExpand };
};

