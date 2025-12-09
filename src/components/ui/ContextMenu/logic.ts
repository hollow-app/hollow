import { ContextMenuProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { hollow } from "hollow";
import { ContextMenuItem } from "@type/hollow";
import { onCleanup, onMount } from "solid-js";

export type LogicType = {};

export const ContextMenuLogic = (
	state: StateType,
	props: ContextMenuProps,
	helper?: HelperType,
): LogicType => {
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
					const start = target.selectionStart;
					const end = target.selectionEnd;
					target.value =
						target.value.slice(0, start) + target.value.slice(end);
					target.setSelectionRange(start, start);
					navigator.clipboard.writeText(selectedText);
					hollow.onCut = null;
					state.setVisible(false);
				};
			}
			hollow.onPaste = async () => {
				const copiedValue = await navigator.clipboard.readText();
				const start = target.selectionStart;
				const end = target.selectionEnd;
				target.value =
					target.value.slice(0, start) +
					copiedValue +
					target.value.slice(end);
				target.setSelectionRange(start, start);
				hollow.onPaste = null;
				state.setVisible(false);
			};
		} else {
			hollow.onPaste = null;
		}

		if (selectedText) {
			hollow.onCopy = () => {
				navigator.clipboard.writeText(selectedText);
				hollow.onCopy = null;
				state.setVisible(false);
			};
		} else {
			hollow.onCopy = null;
			hollow.onCut = null;
		}

		const x = e.clientX;
		const y = e.clientY;

		state.setVisible(true);
		const flipx = x > window.innerWidth - state.contextMenu.scrollWidth;
		const flipy = y > window.innerHeight - state.contextMenu.scrollHeight;
		state.setPosition({
			x: flipx ? x - state.contextMenu.scrollWidth : x,
			y: flipy ? y - state.contextMenu.scrollHeight : y,
			xflip: x > window.innerWidth - state.contextMenu.scrollWidth * 2,
			yflip: y > window.innerHeight - state.contextMenu.scrollHeight * 2,
		});

		requestAnimationFrame(() => state.contextMenu.focus());
		document.body.addEventListener("mousedown", onFocusOut);
	};
	const onFocusOut = (e: MouseEvent) => {
		if (
			state.contextMenu &&
			!state.contextMenu.contains(e.target as Node)
		) {
			state.setVisible(false);
			document.body.removeEventListener("mousedown", onFocusOut);
		}
	};
	const addItems = (newItems: ContextMenuItem) => {
		state.setItems((prev: ContextMenuItem[]) =>
			prev.some((i) => i.id === newItems.id)
				? prev.map((i) => (i.id === newItems.id ? { ...newItems } : i))
				: [...prev, newItems],
		);
	};
	onMount(() => {
		document.body.oncontextmenu = onContextMenu;
		hollow.events.on("context-menu", showContextMenu);
		hollow.events.on("context-menu-extend", addItems);
	});
	onCleanup(() => {
		hollow.events.off("context-menu", showContextMenu);
		hollow.events.off("context-menu-extend", addItems);
	});
	// TODO :?
	const showContextMenu = (b: boolean) => state.setVisible(b);
	return {};
};
