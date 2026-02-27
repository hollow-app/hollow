import {
	createEffect,
	createSignal,
	onCleanup,
	onMount,
	Show,
	JSX,
} from "solid-js";
import { Portal } from "solid-js/web";

type Direction = "top" | "bottom" | "left" | "right";

interface DrawerProps {
	open: boolean;
	onClose: () => void;
	direction?: Direction;
	children: JSX.Element;
	class?: string;
}

export function Drawer(props: DrawerProps) {
	const direction = () => props.direction || "right";
	let containerRef: HTMLDivElement | undefined;

	// Click outside handler logic can be handled by the backdrop click usually,
	// but keeping a ref is good practice.

	const directionClasses = () => {
		switch (direction()) {
			case "right":
				return "inset-y-0 right-0 h-full w-full md:w-96 border-l";
			case "left":
				return "inset-y-0 left-0 h-full w-full md:w-96 border-r";
			case "top":
				return "inset-x-0 top-0 w-full h-auto max-h-[90vh] border-b";
			case "bottom":
				return "inset-x-0 bottom-0 w-full h-auto max-h-[90vh] border-t";
			default:
				return "inset-y-0 right-0 h-full w-full md:w-96 border-l";
		}
	};

	const transformClass = () => {
		if (props.open) return "translate-x-0 translate-y-0";

		switch (direction()) {
			case "right":
				return "translate-x-full";
			case "left":
				return "-translate-x-full";
			case "top":
				return "-translate-y-full";
			case "bottom":
				return "translate-y-full";
		}
	};

	onMount(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && props.open) {
				props.onClose();
			}
		};
		document.addEventListener("keydown", handleEscape);
		onCleanup(() => document.removeEventListener("keydown", handleEscape));
	});

	return (
		<Portal>
			<Show when={props.open}>
				<div
					class="fixed inset-0 z-503 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
					onClick={props.onClose}
				/>

				<div
					ref={containerRef}
					class={`fixed z-503 border-neutral-200 bg-white shadow-xl transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-950 ${directionClasses()} ${transformClass()} ${props.class || ""}`}
					style={{ "will-change": "transform" }}
				>
					{props.open && props.children}
				</div>
			</Show>
		</Portal>
	);
}
