import { createContext, ParentComponent, useContext } from "solid-js";
import { RadioGroupContext } from "./RadioGroup";

interface Props {
	id: string;
	class?: string;
}
export function RadioButton(props: Props) {
	const context = useContext(RadioGroupContext);
	return (
		<div class={props.class ?? ""}>
			<input
				name="radio-group"
				checked={context.isSelected(props.id)}
				type="radio"
			/>
			<span class="radio-checkmark"></span>
		</div>
	);
}
