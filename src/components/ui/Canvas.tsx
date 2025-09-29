import Vault from "@components/Vault";
import useGrid from "@hooks/useGrid";
import { Opthand } from "@type/Opthand";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import "overlayscrollbars/overlayscrollbars.css";
import { createSignal, For, onMount, Show } from "solid-js";

type CanvasProps = {
	cards: () => Opthand[];
	isGridVisible: () => boolean;
};

export default function Canvas({ isGridVisible, cards }: CanvasProps) {
	let canvas!: HTMLDivElement;
	let container!: HTMLDivElement;
	const [size, setSize] = createSignal(null);
	onMount(() => {
		const { width, height } = canvas.getBoundingClientRect();
		(window as any).canvas_size = { w: width, h: height };
		(window as any).canvas_grid = { cw: 0, rh: 0 };
		useGrid();
		setSize({ w: width, h: height });
	});

	return (
		<div
			ref={canvas}
			class="relative w-full h-full overflow-hidden bg-secondary-05/30 border border-secondary-10 rounded-xl"
		>
			<div
				class="absolute top-0 left-0 h-full w-full object-cover"
				style={{
					background: "var(--canvas-bg-image)",
					opacity: "var(--canvas-bg-opacity)",
					"background-size": "cover",
					"background-position": "center",
					"background-repeat": "no-repeat",
				}}
			/>

			<OverlayScrollbarsComponent
				class={"grid-lines relative h-full w-full bg-transparent"}
				style={{
					"--visible": isGridVisible()
						? "var(--secondary-color-15)"
						: "var(--static-grid-lines)",
				}}
				options={{
					scrollbars: {
						visibility: "auto",
						autoHide: "leave",
						autoHideDelay: 800,
						theme: "os-theme-native",
					},
				}}
				defer
			>
				<Show when={size()}>
					<div
						ref={container}
						class={"canvas relative"}
						style={{
							width: `calc(${size().w}px + calc(var(--cw) * var(--offcolumns) - 2px))`,
							height: `calc(${size().h}px + calc(var(--rh) * var(--offrows) - 2px)`,
						}}
					>
						<For each={cards().filter((i) => i.isPlaced)}>
							{({ card, tool, kit }) => {
								return (
									<Vault
										canvas={container}
										card={card}
										tool={tool}
										cardKit={kit}
									/>
								);
							}}
						</For>
					</div>
				</Show>
			</OverlayScrollbarsComponent>
		</div>
	);
}
