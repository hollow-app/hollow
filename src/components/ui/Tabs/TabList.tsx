import { ParentComponent } from "solid-js";
import { useTabs } from "./Tabs";

interface TabListProps {
	class?: string;
}

export const TabList: ParentComponent<TabListProps> = (props) => {
	const { variant } = useTabs();

	return (
		<div
			class={`flex flex-wrap items-center ${props.class || ""}`}
			classList={{
				"gap-2": variant() === "box",
			}}
		>
			{props.children}
		</div>
	);
};
