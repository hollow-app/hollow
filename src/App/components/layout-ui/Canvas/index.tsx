import { Component, For, onCleanup, onMount } from "solid-js";
import "gridstack/dist/gridstack.css";
import { hollow } from "../../../../hollow";
import { Card } from "../Card";
import { useCanvas, CanvasProps } from "./hooks";
import Scrollbar from "smooth-scrollbar";
import { useStore } from "store";
export const Canvas: Component<CanvasProps> = (props) => {
	const { state } = useCanvas(props);
	const store = useStore();
	let scrollEl!: HTMLDivElement;
	onMount(() => {
		const scrollbar = Scrollbar.init(scrollEl, {});
		onCleanup(() => {
			scrollbar.destroy();
		});
	});
	return (
		<div
			ref={state.setCanvasEl}
			class="canvas-parent relative h-full flex-1 shrink-0 overflow-hidden"
		>
			<div ref={scrollEl} class={"h-full w-full"}>
				<div
					class="relative"
					style={{
						width: "calc(100vw - calc(var(--spacing) * 19) - 2px - var(--negative-grid-gap))",
						"min-height":
							"calc(100vh - calc(var(--spacing) * 4) - 2px - var(--negative-grid-gap))",
						"margin-left": "var(--negative-grid-gap)",
						"margin-top": "var(--negative-grid-gap)",
					}}
				>
					<div
						class="grid-stack min-h-full min-w-full"
						ref={state.setGridEl}
					>
						<For
							each={store.state.module.instances.filter(
								(i) => i.data.isPlaced,
							)}
						>
							{(item) => (
								<Card
									node={item}
									grid={state.grid()!}
									canvasEl={state.canvasEl}
								/>
							)}
						</For>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Canvas;
