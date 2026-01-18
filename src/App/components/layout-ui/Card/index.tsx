import { Component } from "solid-js";
import { useCard, CardProps } from "./hooks";
import { useStore } from "@store";

export const Card: Component<CardProps> = (props) => {
	const store = useStore();
	const { state, actions } = useCard(props);

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
				class="relative box-border h-full w-full"
				classList={{
					"cursor-move pointer-events-none":
						store.state.context.isLiveEditor,
				}}
				style={{
					"--p": "calc(var(--grid-gap) * 1px)",
					"padding-left": "var(--p)",
					"padding-top": "var(--p)",
				}}
			>
				<div
					class={"h-full w-full"}
					ref={state.setCardEl}
					style={props.node.style}
					onContextMenu={actions.onContextMenu}
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

export default Card;
