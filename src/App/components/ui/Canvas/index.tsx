import { Component, For } from "solid-js";
import "gridstack/dist/gridstack.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import "overlayscrollbars/overlayscrollbars.css";
import { hollow } from "hollow";
import { Card } from "../Card";
import { useCanvas, CanvasProps } from "./hooks";
export const Canvas: Component<CanvasProps> = (props) => {
	const { state } = useCanvas(props);
	return (
		<div
			ref={state.setCanvasEl}
			class="canvas-parent relative h-full flex-1 shrink-0 overflow-hidden"
		>
			<OverlayScrollbarsComponent
				element="div"
				class={"h-full w-full"}
				options={state.options()}
				defer
			>
				<div
					class="relative"
					style={{
						width: "calc(100vw - calc(var(--spacing) * 19) - 2px - var(--negative-grid-gap))",
						"min-height":
							"calc(100vh - calc(var(--spacing) * 4) - 2px - var(--negative-grid-gap) + calc(var(--spacing) * 10))",
						"margin-left": "var(--negative-grid-gap)",
						"margin-top": "var(--negative-grid-gap)",
					}}
				>
					<div
						class="grid-stack min-h-full min-w-full"
						ref={state.setGridEl}
					>
						<For
							each={hollow.cards().filter((i) => i.data.isPlaced)}
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
					<div class="absolute right-0 bottom-0 left-[calc(var(--grid-gap)*1px)] h-8 rounded-lg bg-[var(--front)]"></div>
				</div>
			</OverlayScrollbarsComponent>
		</div>
	);
};

export default Canvas;
