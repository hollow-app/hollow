import { Accessor, createEffect, createSignal, on, Setter } from "solid-js";
import { CardProps } from ".";
import type { HelperType } from "./helper";
import { hollow } from "hollow";
import { CardType } from "@type/hollow";
import { isSea } from "node:sea";
import { unwrap } from "solid-js/store";

export type StateType = {
	el: HTMLDivElement;
	setEl: (el: HTMLDivElement) => void;
	isLoaded: Accessor<boolean>;
	setLoaded: Setter<boolean>;
	isExpand: Accessor<boolean>;
	setExpand: Setter<boolean>;
};

export const createCardState = (
	props: CardProps,
	helper?: HelperType,
): StateType => {
	let el!: HTMLDivElement;
	const [isLoaded, setLoaded] = createSignal(false);
	const [isExpand, setExpand] = createSignal(false);

	createEffect(
		on(
			() => [props.node.w, props.node.x, props.node.h, props.node.y],
			() => {
				if (props.isLiveEditor()) return;
				props.grid.update(el, props.node);
			},
			{ defer: true },
		),
	);
	return {
		el,
		isLoaded,
		setLoaded,
		isExpand,
		setExpand,
		setEl: (elm) => {
			el = elm;
		},
	};
};
