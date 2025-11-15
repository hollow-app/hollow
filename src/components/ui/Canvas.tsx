import Card from "@components/ui/Card";
import useGrid from "@hooks/useGrid";
import { Opthand } from "@type/Opthand";
import { hollow } from "hollow";
import { Options, PartialOptions } from "overlayscrollbars";
import {
	OverlayScrollbarsComponent,
	OverlayScrollbarsComponentRef,
} from "overlayscrollbars-solid";
import "overlayscrollbars/overlayscrollbars.css";
import { createSignal, For, onMount, Show } from "solid-js";

type CanvasProps = {
	cards: () => Opthand[];
	isGridVisible: () => boolean;
};

export default function Canvas({ isGridVisible, cards }: CanvasProps) {
	let canvas!: OverlayScrollbarsComponentRef;
	let container!: HTMLDivElement;
	const [scrollOption, setScrollOption] = createSignal<PartialOptions>({
		// overflow: {
		// 	x: "hidden",
		// 	y: "hidden",
		// },
		// scrollbars: {
		// 	visibility: "hidden",
		// 	autoHide: "leave",
		// 	autoHideDelay: 800,
		// 	theme: "os-theme-native",
		// },
		// TODO
		overflow: { x: "scroll", y: "scroll" },
		scrollbars: {
			visibility: "auto",
			autoHide: "leave",
			autoHideDelay: 800,
			theme: "os-theme-native",
		},
	});
	const [size, setSize] = createSignal(null);
	onMount(() => {
		const { width, height } = canvas.getElement().getBoundingClientRect();
		hollow.canvas_size = { w: width, h: height };
		hollow.canvas_grid = { cw: 0, rh: 0 };
		useGrid();
		setSize({ w: width, h: height });
	});
	return (
		<div class="bg-secondary/30 border-secondary-10 relative h-full w-full overflow-hidden rounded-xl border">
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
				ref={(r) => (canvas = r)}
				element="div"
				class={"grid-lines relative h-full w-full bg-transparent"}
				style={{
					"--visible": isGridVisible()
						? "var(--secondary-color-15)"
						: "var(--static-grid-lines)",
				}}
				options={scrollOption()}
				defer
			>
				<Show when={size()}>
					<div
						ref={container}
						class="canvas relative"
						style={{
							width: `calc(${size().w}px + calc(var(--cw) * var(--offcolumns) - 2px))`,
							height: `calc(${size().h}px + calc(var(--rh) * var(--offrows) - 2px)`,
						}}
					>
						<For each={cards().filter((i) => i.isPlaced)}>
							{(card) => {
								return (
									<Card
										container={container}
										cardInfo={card}
										setScrollOptions={setScrollOption}
									/>
								);
							}}
						</For>
						{/* <button */}
						{/* 	class="button-primary absolute top-30 left-40" */}
						{/* 	onclick={() => { */}
						{/* 		const removeAlert = hollow.events.emit( */}
						{/* 			"alert", */}
						{/* 			{ */}
						{/* 				type: "loading", */}
						{/* 				title: "Vault", */}
						{/* 				message: "adding 4 images", */}
						{/* 			}, */}
						{/* 		); */}
						{/* 		setTimeout( */}
						{/* 			() => { */}
						{/* 				removeAlert(); */}
						{/* 				hollow.events.emit("alert", { */}
						{/* 					type: "success", */}
						{/* 					title: "Vault", */}
						{/* 					message: "Done adding 4 images", */}
						{/* 				}); */}
						{/* 			}, */}
						{/**/}
						{/* 			5000, */}
						{/* 		); */}
						{/* 	}} */}
						{/* > */}
						{/* 	Load Something */}
						{/* </button> */}
					</div>
				</Show>
			</OverlayScrollbarsComponent>
		</div>
	);
}
