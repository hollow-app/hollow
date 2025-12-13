import { createSignal, createContext, useContext, JSX, Show } from "solid-js";
import type { Property } from "@type/Property";

type UpdateContextType = {
	registerValue: (property: Property) => void;
	// registerFn: (fn:{name:string, fn:(data:any)=>void})=>void;
};

const UpdateContext = createContext<UpdateContextType>();

export function useUpdate() {
	const ctx = useContext(UpdateContext);
	if (!ctx) throw new Error("useUpdate must be used inside UpdateWrapper");
	return ctx;
}

interface Props {
	children: JSX.Element;
	handleSave: (properties: Record<string, any>) => Promise<void>;
}

export function UpdateWrapper(props: Props) {
	const [values, setValues] = createSignal<Record<string, any>>({});

	const registerValue = (property: Property) => {
		setValues((prev) => ({
			...prev,
			[property.name]: property.value,
		}));
	};

	const save = async () => {
		const current = values();
		if (!Object.keys(current).length) return;

		await props.handleSave(current);
		setValues({});
	};

	return (
		<UpdateContext.Provider value={{ registerValue }}>
			<div class="relative h-full">
				{props.children}

				<Show when={Object.keys(values()).length > 0}>
					<div class="absolute right-6 bottom-6 z-50">
						<button class="button-primary px-6 py-3" onclick={save}>
							Save
						</button>
					</div>
				</Show>
			</div>
		</UpdateContext.Provider>
	);
}
