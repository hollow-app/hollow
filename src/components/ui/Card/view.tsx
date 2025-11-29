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
			ref={state.vault}
			class={"z-50 box-border h-full w-full"}
			style={{
				...(state.isExpand()
					? {
							top: 0,
							left: 0,
							width: "calc(100vw - calc(var(--spacing) * 20) - 2px)",
							height: "calc(100vh - calc(var(--spacing) * 4) - 2px)",
							"z-index": 999,
						}
					: {}),
				position: state.isExpand() ? "sticky" : "static",
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
	);
};

