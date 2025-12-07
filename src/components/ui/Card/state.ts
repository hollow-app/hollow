import { Accessor, createEffect, createSignal, on, Setter } from "solid-js";
import { CardProps } from ".";
import type { HelperType } from "./helper";
import { hollow } from "hollow";
import { CardType } from "@type/hollow";

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
	let pz: any = 0;
	createEffect(
		on(
			isExpand,
			(v) => {
				if (v) {
					pz = props.node.style["z-index"] ?? 0;
				}
				hollow.setCards(
					(c: CardType) => c.id === props.node.id,
					"style",
					"z-index",
					v ? 999 : pz,
				);
			},
			{ defer: true },
		),
	);
	return { vault, isLoaded, setLoaded, isExpand, setExpand };
};
