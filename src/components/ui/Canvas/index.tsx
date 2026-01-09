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
			class="canvas-parent relative flex h-full flex-1 overflow-hidden"
		>
			<OverlayScrollbarsComponent
				element="div"
				class={"h-full w-full flex-1"}
				options={state.options()}
				defer
			>
				<div
					style={{
						width: "calc(100vw - calc(var(--spacing) * 19) - 2px)",
						"min-height":
							"calc(100vh - calc(var(--spacing) * 4) - 2px)",
						"margin-left": "var(--negative-grid-gap)",
						"margin-top": "var(--negative-grid-gap)",
					}}
				>
					<div class="grid-stack h-full w-full" ref={state.setGridEl}>
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
				</div>
			</OverlayScrollbarsComponent>
		</div>
	);
};

export default Canvas;
