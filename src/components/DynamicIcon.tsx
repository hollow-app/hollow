import { Match, Switch } from "solid-js";
import FetchedIcon from "./FetchedIcon";

interface Props {
	icon: any;
	class?: string;
}
export function DynamicIcon(props: Props) {
	const type = typeof props.icon === "string" ? "string" : "inline";

	return (
		<Switch>
			<Match when={type === "string"}>
				<FetchedIcon svg={props.icon} class={props.class} />
			</Match>
			<Match when={type === "inline"}>
				<props.icon class={props.class} />
			</Match>
		</Switch>
	);
}
