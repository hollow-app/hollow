import { Accessor } from "solid-js";
import { createContext, createSignal, JSX } from "solid-js";

type DialogContextValue = {
	isOpen: () => boolean;
	toggle: () => void;
	triggerEl: Accessor<HTMLDivElement>;
};

export const DialogContext = createContext<DialogContextValue>();

interface Props extends JSX.HTMLAttributes<HTMLElement> {}
export function Dialog(props: Props) {
	const [triggerEl, setTriggerEl] = createSignal<HTMLDivElement>();
	const [isOpen, setIsOpen] = createSignal(false);

	const toggle = () => setIsOpen((v) => !v);
	return (
		<DialogContext.Provider value={{ isOpen, toggle, triggerEl }}>
			<div ref={setTriggerEl} class="relative size-fit">
				{props.children}
			</div>
		</DialogContext.Provider>
	);
}
