import { splitProps } from "solid-js";
import { JSX } from "solid-js";

interface Props extends JSX.HTMLAttributes<HTMLElement> {
	content: string;
	side?: "left" | "right" | "top" | "bottom";
}
export function Tooltip(props: Props) {
	const [local, rest] = splitProps(props, ["content", "class", "side"]);
	return (
		<div class={local.class + " tool-tip"}>
			{props.children}
			<span data-side={local.side ?? "right"} class="tool-tip-content">
				{local.content}
			</span>
		</div>
	);
}
