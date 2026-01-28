import { ParentComponent, Show, useContext } from "solid-js";
import { DropdownContext } from "./Dropdown";
import Floater from "@utils/kinda-junk/Floater";
import { Placement } from "@floating-ui/dom";
import { Motion, Presence } from "solid-motionone";

type Props = {
	matchWidth?: boolean;
	placement?: Placement;
	center?: boolean;
};
export const DropdownContent: ParentComponent<Props> = (props) => {
	const context = useContext(DropdownContext);

	if (!context) {
		throw new Error("DropdownContent must be used inside Dropdown");
	}

	return (
		<Presence exitBeforeEnter>
			<Show when={context.isOpen()}>
				<Floater
					hide={() => context.toggle()}
					includedEl={context.triggerEl()}
					placement={props.placement}
					animation={{
						initial: { opacity: 0, scale: 0.6 },
						animate: { opacity: 1, scale: 1 },
						exit: { opacity: 0 },
						transition: { duration: 0.2 },
					}}
					class="border-secondary-10 popup-shadow overflow-hidden rounded-md border bg-white text-sm dark:bg-neutral-900"
				>
					<div
						style={
							props.matchWidth && {
								width:
									context.triggerEl().getBoundingClientRect()
										.width + "px",
							}
						}
					>
						{props.children}
					</div>
				</Floater>
			</Show>
		</Presence>
	);
};
