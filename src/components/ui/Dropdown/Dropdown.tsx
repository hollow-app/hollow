import { Accessor } from "solid-js";
import { createContext, createSignal, JSX } from "solid-js";

type DropdownContextValue = {
	isOpen: () => boolean;
	toggle: () => void;
	triggerEl: Accessor<HTMLDivElement>;
};

export const DropdownContext = createContext<DropdownContextValue>();

interface Props extends JSX.HTMLAttributes<HTMLElement> {}
export function Dropdown(props: Props) {
	// let triggerEl!: HTMLDivElement;
	const [triggerEl, setTriggerEl] = createSignal<HTMLDivElement>();
	const [isOpen, setIsOpen] = createSignal(false);

	const toggle = () => setIsOpen((v) => !v);
	return (
		<DropdownContext.Provider value={{ isOpen, toggle, triggerEl }}>
			<div ref={setTriggerEl} class="relative size-fit">
				{props.children}
			</div>
		</DropdownContext.Provider>
	);
}
