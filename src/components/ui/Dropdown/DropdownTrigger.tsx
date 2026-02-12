import { useContext, JSX } from "solid-js";
import { DropdownContext } from "./Dropdown";

interface Props extends JSX.HTMLAttributes<HTMLElement> {
	onHover?: boolean;
}
export const DropdownTrigger = (props: Props) => {
	const context = useContext(DropdownContext);

	if (!context) {
		throw new Error("DropdownTrigger must be used inside Dropdown");
	}
	const onToggle = (nature: "click" | "hover") => {
		if (props.onHover && nature === "hover") {
			context.toggle();
		} else if (!props.onHover && nature === "click") {
			context.toggle();
		}
	};

	return (
		<div
			class="size-fit"
			onclick={() => onToggle("click")}
			onmouseenter={() => onToggle("hover")}
			onmouseleave={() => onToggle("hover")}
		>
			{props.children}
		</div>
	);
};
