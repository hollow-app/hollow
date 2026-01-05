import { Accessor, createUniqueId } from "solid-js";

type Props = {
	checked: boolean;
	onclick: () => void;
};
export default function Checkbox(props: Props) {
	const id = "checkbox-unique-" + createUniqueId();
	return (
		<div class="checkbox">
			<div class="round">
				<input
					type="checkbox"
					id={id}
					checked={props.checked}
					onclick={props.onclick}
				/>
				<label for={id}></label>
			</div>
		</div>
	);
}
