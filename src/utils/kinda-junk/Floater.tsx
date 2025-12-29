import { JSX, onMount, onCleanup, createSignal } from "solid-js";

interface Props {
	children: JSX.Element;
	hide: () => void;
	includedEl: HTMLElement;
	class?: string;
	style?: JSX.CSSProperties;
}

export default function Floater(props: Props) {
	let el!: HTMLDivElement;

	const [position, setPosition] = createSignal<{ left: string; top: string }>(
		{
			left: "0px",
			top: "0px",
		},
	);

	const onPointerDown = (e: PointerEvent) => {
		const target = e.target as Node;

		if (!el.contains(target) && !props.includedEl.contains(target)) {
			props.hide();
		}
	};

	const updatePosition = () => {
		if (!el || !props.includedEl) return;

		const anchor = props.includedEl.getBoundingClientRect();
		const floating = el.getBoundingClientRect();

		let x = anchor.left;
		let y = anchor.bottom;

		if (x + floating.width > window.innerWidth) {
			x = window.innerWidth - floating.width;
		}
		if (x < 0) x = 0;

		if (y + floating.height > window.innerHeight) {
			y = anchor.top - floating.height;
		}

		if (y < 0) y = 0;

		setPosition({
			left: `${Math.round(x)}px`,
			top: `${Math.round(y)}px`,
		});
	};

	onMount(() => {
		updatePosition();

		window.addEventListener("scroll", updatePosition, true);
		window.addEventListener("resize", updatePosition);

		document.addEventListener("pointerdown", onPointerDown, true);
	});

	onCleanup(() => {
		window.removeEventListener("scroll", updatePosition, true);
		window.removeEventListener("resize", updatePosition);
		document.removeEventListener("pointerdown", onPointerDown, true);
	});

	return (
		<div
			ref={el}
			class={"fixed z-601 h-fit w-fit " + (props.class ?? "")}
			style={{
				left: position().left,
				top: position().top,
				...props.style,
			}}
		>
			{props.children}
		</div>
	);
}
