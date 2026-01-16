import { XIcon } from "lucide-solid";
import {
	ComponentProps,
	createSignal,
	createUniqueId,
	JSX,
	onCleanup,
	onMount,
	Show,
} from "solid-js";

type PopupWrapperProps = {
	Icon?: (props: ComponentProps<"svg">) => any;
	title: string;
	children: JSX.Element;
	onClose?: () => void;
	shadow?: boolean;
};

const [focusedId, setFocusedId] = createSignal<string | null>(null);
export default function PopupWrapper({
	Icon,
	title,
	children,
	onClose,
	shadow = true,
}: PopupWrapperProps) {
	const id = createUniqueId();
	const [position, setPosition] = createSignal({ x: 0, y: 0 });
	const isFocus = () => focusedId() === id;
	let winRef!: HTMLDivElement;
	let dragging = false;
	let offset = { x: 0, y: 0 };
	const down = (e: PointerEvent) => {
		dragging = true;
		offset = {
			x: e.clientX - position().x,
			y: e.clientY - position().y,
		};
		window.addEventListener("pointerup", off, { once: true });
		window.addEventListener("pointermove", move);
	};

	const move = (e: PointerEvent) => {
		if (dragging) {
			setPosition({
				x: Math.round(e.clientX - offset.x),
				y: Math.round(e.clientY - offset.y),
			});
		}
	};
	const off = () => {
		dragging = false;
		window.removeEventListener("pointermove", move);
	};

	onMount(() => {
		const winRect = winRef.getBoundingClientRect();
		setPosition({
			x: Math.round((window.innerWidth - winRect.width) / 2),
			y: Math.round((window.innerHeight - winRect.height) / 2),
		});
		setFocusedId(id);
	});
	onCleanup(() => {
		isFocus() && setFocusedId(null);
	});
	return (
		<div
			ref={winRef}
			class="up-pop pointer-events-auto top-0 left-0 flex flex-col gap-3"
			style={{
				left: `${position().x}px`,
				top: `${position().y}px`,
			}}
			classList={{ "z-750": isFocus() }}
		>
			<div
				class="title-panel flex h-fit w-full cursor-grab items-center gap-2 rounded-t-lg select-none"
				onPointerDown={down}
			>
				<Show when={Icon}>
					<Icon class="text-secondary-50 bg-secondary-10 size-8 rounded-md p-1.5" />
				</Show>
				<h1 class="h1-title">{title}</h1>
				<Show when={onClose}>
					<button
						class="bg-secondary-15 group mr-2 ml-auto rounded-full"
						onclick={onClose}
					>
						<XIcon class="text-secondary-50 size-4 p-0.5 opacity-0 group-hover:opacity-100" />
					</button>
				</Show>
			</div>

			{children}
		</div>
	);
}
