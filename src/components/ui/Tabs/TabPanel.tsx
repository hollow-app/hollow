import { ParentComponent, Show } from "solid-js";
import { useTabs } from "./Tabs";

interface TabPanelProps {
	value: string;
	class?: string;
	first?: boolean;
	last?: boolean;
}

export const TabPanel: ParentComponent<TabPanelProps> = (props) => {
	const { value, variant } = useTabs();

	return (
		<Show when={value() === props.value}>
			<div
				role="tabpanel"
				class={`outline-none ${props.class || ""}`}
				classList={{
					"p-5 bg-secondary mt-2 rounded-lg": variant() === "box",
					"rounded-b-lg rounded-tr-lg":
						variant() === "lift" && props.first,
					"rounded-b-lg rounded-tl-lg":
						variant() === "lift" && props.last,
					"rounded-lg":
						variant() === "lift" && !props.last && !props.first,
					"border border-secondary-15 p-4": variant() === "lift",
				}}
			>
				{props.children}
			</div>
		</Show>
	);
};
