import { Property } from "@app/type/Property";
import setStyle from "./setStyle";
import { getSettingsConfig } from "@app/managers/Settings/effects";

export default function useGrid(properties?: Property[]) {
	const options: Property[] =
		properties ??
		Object.entries(getSettingsConfig("grid-gap")).map(([k, v]) => ({
			name: k,
			value: v,
		}));
	setStyle(options);
}
