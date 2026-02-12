import { useContext, JSX } from "solid-js";
import { DialogContext } from "./Dialog";

interface Props extends JSX.HTMLAttributes<HTMLElement> {}
export const DialogTrigger = (props: Props) => {
	const context = useContext(DialogContext);
	if (!context) {
		throw new Error("DialogTrigger must be used inside Dialog");
	}
	return (
		<div class="size-fit" onclick={context.toggle}>
			{props.children}
		</div>
	);
};
