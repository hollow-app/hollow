import { JSX } from "solid-js";
interface Props extends JSX.HTMLAttributes<HTMLElement> {}
export function Kbd(props: Props) {
	return (
		<span class={"keyboard-button text-xs select-none " + props.class}>
			{props.children}
		</span>
	);
}
