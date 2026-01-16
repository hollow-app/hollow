import { Property } from "@type/Property";
import setStyle from "./setStyle";
import { useStore } from "../store";

export default function useGrid(properties?: Property[]) {
	const { state } = useStore();
	const options: Property[] =
		properties ??
		Object.entries(state.settings["grid-gap"]).map(([k, v]) => ({
			name: k,
			value: v,
		}));
	setStyle(options);
}
