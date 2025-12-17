import { CanvasProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import "gridstack/dist/gridstack.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import "overlayscrollbars/overlayscrollbars.css";
import { For, onMount, Show } from "solid-js";
import { hollow } from "hollow";
import { Card } from "../Card";
import { debounce } from "@utils/index";

export const CanvasView = (
	state: StateType,
	logic: LogicType,
	props: CanvasProps,
	helper?: HelperType,
) => {
	return (
		<div
			class="bg-secondary/30 relative h-full w-full overflow-hidden rounded-xl border"
			classList={{
				"border-secondary-10": state.isAnySidePanelVisible().state,
				"border-transparent": !state.isAnySidePanelVisible().state,
			}}
		>
			{/* <div */}
			{/* 	class="absolute top-0 left-0 h-full w-full object-cover" */}
			{/* 	style={{ */}
			{/* 		background: "var(--canvas-bg-image)", */}
			{/* 		opacity: "var(--canvas-bg-opacity)", */}
			{/* 		"background-size": "cover", */}
			{/* 		"background-position": "center", */}
			{/* 		"background-repeat": "no-repeat", */}
			{/* 	}} */}
			{/* /> */}
			{/* <div class="" */}
			{/**/}
			{/* > */}
			<OverlayScrollbarsComponent
				element="div"
				class={"relative h-full w-full bg-transparent"}
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
						"min-width":
							"calc(100vw - calc(var(--spacing) * 19) - 2px)",
						"min-height":
							"calc(100vh - calc(var(--spacing) * 4) - 2px)",
					}}
				>
					<For each={hollow.cards().filter((i) => i.data.isPlaced)}>
						{(item) => (
							<Card
								node={item}
								grid={state.grid}
								isLiveEditor={props.isLiveEditor}
								setAnyExpaneded={props.setAnyExpanded}
								isAnySidePanelVisible={
									state.isAnySidePanelVisible
								}
							/>
						)}
					</For>
					<Show when={props.anyExpanded()}>
						<div class="bg-secondary absolute z-501 h-full w-full" />
					</Show>
				</div>
			</OverlayScrollbarsComponent>
			{/* </div> */}
		</div>
	);
};
