import { createMemo, ParentComponent, useContext } from "solid-js";
import { RadioGroupContext } from "./RadioGroup";

// interface RadioGroupItemContextValue {}
// export const RadioGroupItemContext =
// 	createContext<RadioGroupItemContextValue>();
interface Props {
	id: any;
	disabled?: boolean;
	class?: string;
}

export const RadioGroupItem: ParentComponent<Props> = (props) => {
	const context = useContext(RadioGroupContext);
	return (
		<label
			onClick={() => context.setSelected(props.id)}
			class={`radio-button cursor-pointer ${props.class ?? ""}`}
			classList={{ "opacity-50 cursor-not-allowed": props.disabled }}
		>
			{props.children}
		</label>
	);
};
