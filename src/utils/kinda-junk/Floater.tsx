import { JSX } from "solid-js";
import { createSignal, onMount, onCleanup } from "solid-js";

interface Props {
	children: JSX.Element;
	hide: () => void;
}
export default function Floater(props: Props) {
	let el!: HTMLDivElement;
	const [position, setPosition] = createSignal({ x: 0, y: 0 });

	const onclickout = (event: MouseEvent) => {
		if (!el.contains(event.target as Node)) {
			props.hide();
		}
	};

	onMount(() => {
		const { width, height, left, top } = el.getBoundingClientRect();
		const appRect = document.documentElement.getBoundingClientRect();
		const elWidth = width + left;
		const elHeight = height + top;
		setPosition({
			x: Math.round(
				elWidth > appRect.width ? elWidth - appRect.width : 0,
			),
			y: Math.round(
				elHeight > appRect.height ? elHeight - appRect.height : 0,
			),
		});
		document.documentElement.addEventListener("click", onclickout);
	});
	onCleanup(() => {
		document.documentElement.removeEventListener("click", onclickout);
	});
	return (
		<div
			ref={el}
			class="absolute z-10 h-fit w-fit"
			style={{
				transform: `translate(-${position().x}px, -${position().y}px)`,
			}}
		>
			{props.children}
		</div>
	);
}
