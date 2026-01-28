import { ParentComponent, useContext, JSX } from "solid-js";
import { DropdownContext } from "./Dropdown";

export const DropdownTrigger: ParentComponent = (props) => {
	const context = useContext(DropdownContext);

	if (!context) {
		throw new Error("DropdownTrigger must be used inside Dropdown");
	}

	return (
		<div class="size-fit" onClick={context.toggle}>
			{props.children}
		</div>
	);
};
