import { Component } from "solid-js";
import { useCard, CardProps } from "./hooks";

export const Card: Component<CardProps> = (props) => {
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
				class="box-border h-full w-full"
				classList={{
					"cursor-move pointer-events-none": props.isLiveEditor(),
				}}
				style={{
					"--p": "calc(var(--grid-gap) * 1px)",
					"padding-left": "var(--p)",
					"padding-top": "var(--p)",
				}}
			>
				<div
					class={"h-full w-full"}
					style={{
						position: state.isExpand() ? "fixed" : "static",
						...props.node.style,
						...(state.isExpand()
							? {
									top: "calc(var(--spacing) * 2)",
									left: "calc(var(--layout-left) + calc(var(--spacing) * 17))",
									width: "calc(100vw - var(--layout-width) - calc(var(--spacing) * 19))",
									height: "calc(100vh - calc(var(--spacing) * 4))",
									// background: "var(--color-secondary)",
									"border-width": "0px",
									"border-radius": "var(--radius-xl)",
									"z-index": "502",
								}
							: {}),
					}}
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
