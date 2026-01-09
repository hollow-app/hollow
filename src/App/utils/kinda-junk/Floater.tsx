import { JSX, onMount, onCleanup, createSignal } from "solid-js";
import {
	computePosition,
	autoUpdate,
	offset,
	flip,
	shift,
	Placement,
} from "@floating-ui/dom";

interface Props {
	children: JSX.Element;
	hide: () => void;
	includedEl: HTMLElement;
	class?: string;
	style?: JSX.CSSProperties;
	placement?: Placement;
}

export default function Floater(props: Props) {
	let el!: HTMLDivElement;

	const [position, setPosition] = createSignal<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});

	const onPointerDown = (e: PointerEvent) => {
		const target = e.target as Node;

		if (!el.contains(target) && !props.includedEl.contains(target)) {
			props.hide();
		}
	};

	let cleanupAutoUpdate: (() => void) | undefined;

	onMount(() => {
		if (!el || !props.includedEl) return;

		const updatePosition = () => {
			computePosition(props.includedEl, el, {
				placement: props.placement || "bottom-start",
				middleware: [offset(8), flip(), shift({ padding: 8 })],
			}).then(({ x, y }) => {
				setPosition({ x, y });
			});
		};

		updatePosition();

		cleanupAutoUpdate = autoUpdate(props.includedEl, el, updatePosition);

		document.addEventListener("pointerdown", onPointerDown, true);
	});

	onCleanup(() => {
		cleanupAutoUpdate?.();
		document.removeEventListener("pointerdown", onPointerDown, true);
	});

	return (
		<div
			ref={el}
			class={"fixed z-601 h-fit w-fit " + (props.class ?? "")}
			style={{
				left: `${position().x}px`,
				top: `${position().y}px`,
				...props.style,
			}}
		>
			{props.children}
		</div>
	);
}
