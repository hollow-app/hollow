import { manager } from "./index";
import { Property } from "@type/Property";
import setStyle from "./setStyle";

export default function useGrid(properties?: Property[]) {
	const options: Property[] =
		properties ??
		Object.entries(SettingsManager.getSelf().getConfigs(["grid-gap"])).map(
			([k, v]) => ({ name: k, value: v }),
		);
	setStyle(options);
}
