import { splitProps } from "solid-js";
import { JSX } from "solid-js";
import { Accessor, createUniqueId } from "solid-js";

interface Props {
	checked: boolean;
	onclick: () => void;
}

export function Checkbox(props: Props) {
	const [local, rest] = splitProps(props, ["checked", "onclick"]);
	const id = "checkbox-unique-" + createUniqueId();
	return (
		<div class="checkbox">
			<div class="round">
				<input
					type="checkbox"
					id={id}
					checked={local.checked}
					onclick={local.onclick}
				/>
				<label for={id}></label>
			</div>
		</div>
	);
}
