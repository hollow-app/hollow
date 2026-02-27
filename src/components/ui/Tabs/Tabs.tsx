import {
	createContext,
	createSignal,
	ParentComponent,
	useContext,
	Accessor,
	Setter,
} from "solid-js";

export type TabsVariant = "lift" | "box" | "default";

interface TabsContextValue {
	value: Accessor<string>;
	setValue: (value: string | ((prev: string) => string)) => void;
	variant: Accessor<TabsVariant | undefined>;
}

const TabsContext = createContext<TabsContextValue>();

export const useTabs = () => {
	const context = useContext(TabsContext);
	if (!context) {
		throw new Error("useTabs must be used within a Tabs component");
	}
	return context;
};

interface TabsProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	variant?: TabsVariant;
	class?: string;
}

export const Tabs: ParentComponent<TabsProps> = (props) => {
	const [value, setValue] = createSignal(
		props.value || props.defaultValue || "",
	);

	const handleSetValue = (newValue: string | ((prev: string) => string)) => {
		const nextValue =
			typeof newValue === "function"
				? (newValue as (prev: string) => string)(value())
				: newValue;
		setValue(nextValue);
		props.onChange?.(nextValue);
		return nextValue;
	};

	return (
		<TabsContext.Provider
			value={{
				value: () => props.value ?? value(),
				setValue: handleSetValue,
				variant: () => props.variant,
			}}
		>
			<div
				class={`w-full ${props.class || ""}`}
				classList={{
					"rounded-lg p-2 bg-secondary-05": props.variant === "box",
				}}
			>
				{props.children}
			</div>
		</TabsContext.Provider>
	);
};
