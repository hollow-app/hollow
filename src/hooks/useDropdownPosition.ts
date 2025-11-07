import { createSignal, onCleanup } from "solid-js";

export function useDropdownPosition() {
	const [pos, setPos] = createSignal({ top: 0, left: 0, openUp: false });

	const updatePosition = (inputRef: HTMLElement | undefined) => {
		if (!inputRef) return;
		const rect = inputRef.getBoundingClientRect();
		const dropdownHeight = 160;
		const spaceBelow = window.innerHeight - rect.bottom;
		const openUp = spaceBelow < dropdownHeight;

		setPos({
			top: openUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
			left: rect.left,
			openUp,
		});
	};

	const handleClickOutside = (
		ref1?: HTMLElement,
		ref2?: HTMLElement,
		close?: () => void,
	) => {
		return (e: PointerEvent) => {
			const target = e.target as Node;
			if (
				ref1 &&
				!ref1.contains(target) &&
				ref2 &&
				!ref2.contains(target)
			) {
				close?.();
			}
		};
	};

	onCleanup(() => {
		document.removeEventListener("resize", () => {});
	});

	return { pos, setPos, updatePosition, handleClickOutside };
}
