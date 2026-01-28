import { createSignal, createUniqueId, JSX, splitProps } from "solid-js";

interface Props {
	checked: boolean;
	onchange: (checked: boolean) => void;
	class?: string;
}

export function Switch(props: Props) {
	const [local, rest] = splitProps(props, ["checked", "onchange", "class"]);
	const [checked, setChecked] = createSignal(local.checked);
	const id = "switch-unique-" + createUniqueId();
	const onChange = (v: boolean) => {
		setChecked(v);
		local.onchange(v);
	};

	return (
		<div class="toggle-switch">
			<input
				class="toggle-input"
				id={id}
				type="checkbox"
				checked={checked()}
				onchange={(e) => onChange(e.currentTarget.checked)}
			/>
			<label class="toggle-label" for={id}></label>
		</div>
	);
}
