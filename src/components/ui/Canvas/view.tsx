import { CanvasProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import { createEffect, For, on } from "solid-js";
import { hollow } from "hollow";
import { Car } from "lucide-solid";
import { Card } from "../Card";
import { onCleanup } from "solid-js";

export const CanvasView = (
	state: StateType,
	logic: LogicType,
	props: CanvasProps,
	helper?: HelperType,
) => {
	return (
		<div class="bg-secondary/30 border-secondary-10 relative h-full w-full overflow-hidden rounded-xl border">
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
			<div class="overflow-auto">
				<div
					style={{
						"min-width":
							"calc(100vw - calc(var(--spacing) * 20) - 2px)",
						"min-height":
							"calc(100vh - calc(var(--spacing) * 4) - 2px)",
					}}
				>
					<div class="grid-stack" ref={state.gridEl}>
						<For
							each={hollow.cards().filter((i) => i.data.isPlaced)}
						>
							{(item) => <Card node={item} grid={state.grid} />}
						</For>
					</div>
				</div>
			</div>
		</div>
	);
};
