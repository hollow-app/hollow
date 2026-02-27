import { ParentComponent } from "solid-js";
import { useTabs } from "./Tabs";
import MyIcon, { MyIconsType } from "@app/components/ui/MyIcon";
import { Show } from "solid-js";

interface TabProps {
	value: string;
	class?: string;
	icon?: MyIconsType;
	disabled?: boolean;
	last?: boolean;
}

export const Tab: ParentComponent<TabProps> = (props) => {
	const { value, setValue, variant } = useTabs();
	const isSelected = () => value() === props.value;

	return (
		<button
			type="button"
			role="tab"
			aria-selected={isSelected()}
			disabled={props.disabled}
			onClick={() => !props.disabled && setValue(props.value)}
			class={`relative flex items-center gap-2 px-4 py-2 text-sm outline-none ${
				props.class || ""
			}`}
			classList={{
				// Base styles
				"ml-auto": props.last,

				"cursor-pointer text-secondary-40 hover:text-secondary-60":
					!isSelected() && !props.disabled,
				"text-secondary-foreground": isSelected(),
				"opacity-50 cursor-not-allowed": props.disabled,

				// Box Variant (Pill like)
				"rounded-md hover:bg-muted":
					variant() === "box" && !isSelected(),
				"rounded-md bg-secondary text-secondary-foreground shadow-sm":
					variant() === "box" && isSelected(),

				// Lift Variant
				"rounded-t-lg -mb-px border": variant() === "lift",
				"border-transparent":
					["lift", "default"].includes(variant()) && !isSelected(),
				"border-x-secondary-15 z-20 border-t-secondary-15 border-b-secondary border-border bg-background":
					variant() === "lift" && isSelected(),
				// default
				"-mb-px border-b-2": variant() === "default",
				"border-primary": variant() === "default" && isSelected(),
			}}
		>
			<Show when={props.icon}>
				<MyIcon
					name={props.icon}
					class="text-secondary-30 size-5 transition-colors"
					classList={{ "text-secondary-50": isSelected() }}
				/>
			</Show>
			{props.children}
		</button>
	);
};
