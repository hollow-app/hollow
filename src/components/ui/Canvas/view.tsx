import { CanvasProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import "gridstack/dist/gridstack.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import "overlayscrollbars/overlayscrollbars.css";
import { For } from "solid-js";
import { hollow } from "hollow";
import { Card } from "../Card";

export const CanvasView = (
	state: StateType,
	logic: LogicType,
	props: CanvasProps,
	helper?: HelperType,
) => {
	return (
		<div
			class="canvas-parent border-secondary relative h-full w-full overflow-hidden outline"
			classList={{
				"outline-secondary-10 border-5": state.isAnySidePanelVisible(),
				"rounded-xl":
					state.isAnySidePanelVisible() || props.anyExpanded(),
				"outline-secondary": !state.isAnySidePanelVisible(),
			}}
		>
			<OverlayScrollbarsComponent
				element="div"
				class={"h-full w-full"}
				options={{
					overflow: { x: "scroll", y: "scroll" },
					scrollbars: {
						visibility: "auto",
						autoHide: "leave",
						autoHideDelay: 800,
						theme: "os-theme-native",
					},
				}}
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
								grid={state.grid}
								isLiveEditor={props.isLiveEditor}
								setAnyExpaneded={props.setAnyExpanded}
							/>
						)}
					</For>
					{/* <Show when={props.anyExpanded()}> */}
					{/* 	<div class="bg-secondary absolute z-501 h-full w-full" /> */}
					{/* </Show> */}
				</div>
			</OverlayScrollbarsComponent>
			{/* </div> */}
		</div>
	);
};
