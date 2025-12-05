import { setFips } from "crypto";
import { XIcon } from "lucide-solid";
import {
	ComponentProps,
	createSignal,
	JSX,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { Dynamic } from "solid-js/web";

type PopupWrapperProps = {
	Icon: (props: ComponentProps<"svg">) => any;
	title: string;
	children: JSX.Element;
	onClose?: () => void;
	shadow?: boolean;
};

export default function PopupWrapper({
	Icon,
	title,
	children,
	onClose,
	shadow = true,
}: PopupWrapperProps) {
	const [position, setPosition] = createSignal({ x: 0, y: 0 });
	const [isFocus, setFocus] = createSignal(true);
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
				x: e.clientX - offset.x,
				y: e.clientY - offset.y,
			});
		}
	};
	const off = () => {
		dragging = false;
		window.removeEventListener("pointermove", move);
	};
	const onOutside = (e: PointerEvent) => {
		if (!winRef.contains(e.target as Node)) {
			setFocus(false);
		}
	};

	onMount(() => {
		const winRect = winRef.getBoundingClientRect();
		setPosition({
			x: (window.innerWidth - winRect.width) / 2,
			y: (window.innerHeight - winRect.height) / 2,
		});
		window.addEventListener("pointerdown", onOutside);
	});
	onCleanup(() => {
		window.removeEventListener("pointerdown", onOutside);
	});
	return (
		<div
			ref={winRef}
			onPointerDown={() => setFocus(true)}
			class="up-pop pointer-events-auto top-0 left-0 flex flex-col gap-3 transition-none"
			style={{
				transform: `translate(${position().x}px, ${position().y}px)`,
			}}
			classList={{ "z-50": isFocus() }}
		>
			<div
				class="title-panel flex h-fit w-full cursor-grab items-center gap-2 rounded-t-lg select-none"
				onPointerDown={down}
			>
				<Icon class="text-secondary-50 m-1 size-5" />
				<h1 class="h1-title">{title}</h1>
				<Show when={onClose}>
					<button
						class="bg-secondary-10 group ml-auto rounded-full"
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
