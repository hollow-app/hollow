import { ParentComponent, Show, useContext } from "solid-js";
import { DialogContext } from "./Dialog";
import { Presence } from "solid-motionone";

type Props = {};
export const DialogContent: ParentComponent<Props> = (props) => {
	const context = useContext(DialogContext);

	if (!context) {
		throw new Error("DialogContent must be used inside Dialog");
	}

	return (
		<Presence exitBeforeEnter>
			<Show when={context.isOpen()}>
				<div class="fixed inset-0 z-667 flex size-full items-center justify-center bg-black/20 backdrop-blur-xs">
					<div
						class="absolute inset-0"
						onclick={() => context.toggle()}
					/>
					<div class="">{props.children}</div>
				</div>
			</Show>
		</Presence>
	);
};
