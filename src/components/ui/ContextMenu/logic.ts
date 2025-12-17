import { ContextMenuProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { hollow } from "hollow";
import { ContextMenuItem } from "@type/hollow";
import { createEffect, createMemo, on, onCleanup, onMount } from "solid-js";

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
		requestAnimationFrame(() => {
			state.el().focus();
			const flipx = x > window.innerWidth - state.el().scrollWidth;
			const flipy = y > window.innerHeight - state.el().scrollHeight;
			state.setPosition({
				x: flipx ? x - state.el().scrollWidth : x,
				y: flipy ? y - state.el().scrollHeight : y,
				// this condition is for the extra panels, has nothing to do with x and y above
				xflip: x > window.innerWidth - state.el().scrollWidth * 2,
				yflip: y > window.innerHeight - state.el().scrollHeight * 2,
			});
		});
		document.body.addEventListener("mousedown", onFocusOut);
	};

	const onFocusOut = (e: MouseEvent) => {
		if (state.el() && !state.el().contains(e.target as Node)) {
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
		hollow.pevents.on("context-menu", state.setVisible);
		hollow.events.on("context-menu-extend", addItems);
	});
	onCleanup(() => {
		hollow.pevents.off("context-menu", state.setVisible);
		hollow.events.off("context-menu-extend", addItems);
	});
	return {};
};
