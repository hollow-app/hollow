import { CardProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";

export const CardView = (
	state: StateType,
	logic: LogicType,
	props: CardProps,
	helper?: HelperType,
) => {
	return (
		<div
			ref={state.setEl}
			class="grid-stack-item"
			gs-id={props.node.id}
			gs-x={props.node.x}
			gs-y={props.node.y}
			gs-w={props.node.w}
			gs-h={props.node.h}
		>
			<div
				class="box-border h-full w-full"
				classList={{
					"cursor-move pointer-events-none": props.isLiveEditor(),
				}}
				style={{ padding: "calc(var(--grid-gap) * 1px)" }}
			>
				<div
					class={"h-full w-full border-solid"}
					style={{
						position: state.isExpand() ? "fixed" : "static",
						...(state.isExpand()
							? {
									top: "calc(var(--spacing) * 2 + 1px)",
									left: "calc(var(--layout-left) + calc(var(--spacing) * 19) + 2px)",
									width: "calc(100vw - var(--layout-width) - calc(var(--spacing) * 21) - 3px)",
									height: "calc(100vh - calc(var(--spacing) * 4) - 2px)",
									background: "var(--color-secondary)",
									"border-width": "0px",
									"border-radius": "var(--radius-xl)",
									"z-index": "502",
									// transition:
									// 	"width 0.5s ease-out, left 0.5s ease-out",
								}
							: props.node.style),
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
		</div>
	);
};
