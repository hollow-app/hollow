import { CardProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import { onMount } from "solid-js";
import { unwrap } from "solid-js/store";

export const CardView = (
	state: StateType,
	logic: LogicType,
	props: CardProps,
	helper?: HelperType,
) => {
	return (
		<div
			ref={state.el}
			class="grid-stack-item box-border h-full w-full p-2"
			gs-id={props.node.id}
			gs-x={props.node.x}
			gs-y={props.node.y}
			gs-w={props.node.w}
			gs-h={props.node.h}
		>
			<div
				class={"h-full w-full border-solid"}
				style={{
					position: state.isExpand() ? "absolute" : "static",
					...(state.isExpand()
						? {
								// top:
								// 	-(props.kit.viewport().y + props.node.y) + "px",
								// left:
								// 	-(props.kit.viewport().x + props.node.x) + "px",
								width: "calc(100vw - var(--layout-width) - calc(var(--spacing) * 20) - 2px)",
								height: "calc(100vh - calc(var(--spacing) * 4) - 2px)",
								background: "var(--color-secondary)",
							}
						: {
								background: "var(--color-secondary-05)",
								"border-radius": "10px",
							}),
				}}
				onContextMenu={logic.onContextMenu}
			>
				<div
					id={props.node.id}
					class="h-full w-full"
					classList={{
						"card-spot": !state.isLoaded(),
					}}
				></div>
			</div>
		</div>
	);
};
