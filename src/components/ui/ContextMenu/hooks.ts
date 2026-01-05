import {
	createSignal,
	onMount,
	onCleanup,
	Accessor,
	Setter,
	createMemo,
} from "solid-js";
import { hollow } from "hollow";
import { ContextMenuItem, ContextMenuItemButton } from "@type/hollow";

export interface ContextMenuProps {}

interface PositionType {
	x: number;
	y: number;
	xflip: boolean;
	yflip: boolean;
}

export interface ContextMenuState {
	el: Accessor<HTMLDivElement | undefined>;
	setEl: (elm: HTMLDivElement) => void;
	items: Accessor<ContextMenuItem[]>;
	setItems: Setter<ContextMenuItem[]>;
	position: Accessor<PositionType>;
	setPosition: Setter<PositionType>;
	isVisible: Accessor<boolean>;
	setVisible: Setter<boolean>;
}

export interface ContextMenuHook {
	state: ContextMenuState;
}

export const useContextMenu = (): ContextMenuHook => {
	const [el, setElSignal] = createSignal<HTMLDivElement>();
	const [items, setItems] = createSignal<ContextMenuItem[]>([]);
	const [position, setPosition] = createSignal<PositionType>({
		x: 300,
		y: 300,
		xflip: false,
		yflip: false,
	});
	const [isVisible, setVisible] = createSignal(false);

	const onContextMenu = (e: MouseEvent) => {
		e.preventDefault();

		const selection = window.getSelection();
		const selectedText = selection?.toString().trim();
		const target = e.target;

		if (
			(target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement) &&
			!target.readOnly &&
			!target.disabled
		) {
			if (selectedText) {
				hollow.onCut = () => {
					const start = target.selectionStart || 0;
					const end = target.selectionEnd || 0;
					target.value =
						target.value.slice(0, start) + target.value.slice(end);
					target.setSelectionRange(start, start);
					navigator.clipboard.writeText(selectedText);
					hollow.onCut = null;
					setVisible(false);
				};
			}
			hollow.onPaste = async () => {
				const copiedValue = await navigator.clipboard.readText();
				const start = target.selectionStart || 0;
				const end = target.selectionEnd || 0;
				target.value =
					target.value.slice(0, start) +
					copiedValue +
					target.value.slice(end);
				target.setSelectionRange(start, start);
				hollow.onPaste = null;
				setVisible(false);
			};
		} else {
			hollow.onPaste = null;
		}

		if (selectedText) {
			hollow.onCopy = () => {
				navigator.clipboard.writeText(selectedText);
				hollow.onCopy = null;
				setVisible(false);
			};
		} else {
			hollow.onCopy = null;
			hollow.onCut = null;
		}

		const x = e.clientX;
		const y = e.clientY;

		setVisible(true);
		requestAnimationFrame(() => {
			const element = el();
			if (element) {
				element.focus();
				const flipx = x > window.innerWidth - element.scrollWidth;
				const flipy = y > window.innerHeight - element.scrollHeight;
				setPosition({
					x: flipx ? x - element.scrollWidth : x,
					y: flipy ? y - element.scrollHeight : y,
					xflip: x > window.innerWidth - element.scrollWidth * 2,
					yflip: y > window.innerHeight - element.scrollHeight * 2,
				});
			}
		});
		document.body.addEventListener("mousedown", onFocusOut);
	};

	const onFocusOut = (e: MouseEvent) => {
		const element = el();
		if (element && !element.contains(e.target as Node)) {
			setVisible(false);
			document.body.removeEventListener("mousedown", onFocusOut);
		}
	};

	const addItems = (newItems: ContextMenuItem) => {
		setItems((prev: ContextMenuItem[]) =>
			prev.some((i) => i.id === newItems.id)
				? prev.map((i) => (i.id === newItems.id ? { ...newItems } : i))
				: [...prev, newItems],
		);
	};

	onMount(() => {
		document.body.oncontextmenu = onContextMenu;
		hollow.pevents.on("context-menu", setVisible);
		hollow.events.on("context-menu-extend", addItems);
	});

	onCleanup(() => {
		hollow.pevents.off("context-menu", setVisible);
		hollow.events.off("context-menu-extend", addItems);
	});

	return {
		state: {
			el,
			setEl: setElSignal,
			items,
			setItems,
			position,
			setPosition,
			isVisible,
			setVisible,
		},
	};
};
