import { JSX } from "solid-js";

interface Props {
	class?: string;
	style?: JSX.CSSProperties;
}
export default function DashPanel(props: Props) {
	return (
		<div class={props.class} style={props.style}>
			<div></div>
		</div>
	);
}
