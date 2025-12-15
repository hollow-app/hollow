import { Accessor, Setter } from "solid-js";
import { ContextMenuProps } from ".";
import type { HelperType } from "./helper";
import { ContextMenuItem } from "@type/hollow";
import { createSignal } from "solid-js";

interface PositionType {
	x: number;
	y: number;
	xflip: boolean;
	yflip: boolean;
}
export type StateType = {
	el: () => HTMLDivElement;
	setEl: (elm: HTMLDivElement) => void;
	items: Accessor<ContextMenuItem[]>;
	setItems: Setter<ContextMenuItem[]>;
	position: Accessor<PositionType>;
	setPosition: Setter<PositionType>;
	isVisible: Accessor<boolean>;
	setVisible: Setter<boolean>;
};

export const createContextMenuState = (
	props: ContextMenuProps,
	helper?: HelperType,
): StateType => {
	let el!: HTMLDivElement;
	const [items, setItems] = createSignal<ContextMenuItem[]>([]);
	const [position, setPosition] = createSignal({
		x: 300,
		y: 300,
		xflip: false,
		yflip: false,
	});
	const [isVisible, setVisible] = createSignal(false);
	return {
		el: () => el,
		setEl: (elm) => {
			el = elm;
		},
		items,
		setItems,
		position,
		setVisible,
		setPosition,
		isVisible,
	};
};
