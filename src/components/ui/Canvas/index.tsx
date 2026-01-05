import { Component, createEffect, createSignal, For, on } from "solid-js";
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
			class="canvas-parent relative h-full w-full overflow-hidden"
		>
			<OverlayScrollbarsComponent
				element="div"
				class={"h-full w-full"}
				options={state.options()}
				defer
			>
				<div
					class="grid-stack"
					ref={state.setGridEl}
					style={{
						"--m": "calc(var(--grid-gap) * -1px)",
						"min-width":
							"calc(100vw - calc(var(--spacing) * 19) - 2px)",
						"min-height":
							"calc(100vh - calc(var(--spacing) * 4) - 2px)",
						"margin-left": "var(--m)",
						"margin-top": "var(--m)",
					}}
				>
					<For each={hollow.cards().filter((i) => i.data.isPlaced)}>
						{(item) => (
							<Card
								node={item}
								grid={state.grid()!}
								canvasEl={state.canvasEl}
								isLiveEditor={props.isLiveEditor}
							/>
						)}
					</For>
				</div>
			</OverlayScrollbarsComponent>
		</div>
	);
};

export default Canvas;
