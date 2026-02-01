import { Accessor } from "solid-js";
import { createSelector } from "solid-js";
import { Setter } from "solid-js";
import { createContext, createSignal, ParentComponent } from "solid-js";

type RadioGroupContextValue = {
	selected: Accessor<any>;
	setSelected: Setter<any>;
	isSelected: (key: any) => boolean;
};

export const RadioGroupContext = createContext<RadioGroupContextValue>();
interface Props {
	selected?: any;
}
export const RadioGroup: ParentComponent<Props> = (props) => {
	const [selected, setSelected] = createSignal(props.selected);
	const isSelected = createSelector(selected);
	return (
		<RadioGroupContext.Provider
			value={{ selected, setSelected, isSelected }}
		>
			{props.children}
		</RadioGroupContext.Provider>
	);
};
