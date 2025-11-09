import { GridInfo } from "@type/GridInfo";
import { Property } from "@type/Property";
import setStyle from "./setStyle";
import { RealmManager } from "@managers/RealmManager";
import { hollow } from "hollow";
import { SettingsManager } from "@managers/SettingsManager";

export default function useGrid(properties?: Property[]) {
	let vars: Property[] = [];
	const updateGridVariable = (name: string, value: number) => {
		if (name === "columns") {
			const width = hollow.canvas_size.w;
			const cw = width / value;
			hollow.canvas_grid.cw = cw;
			vars.push({
				name: "--cw",
				value: `${cw}px`,
			});
			vars.push({
				name: "--canvas-w",
				value: `${width - value}px`,
			});
		} else if (name === "rows") {
			const height = hollow.canvas_size.h;
			const rh = height / value;
			hollow.canvas_grid.rh = rh;
			vars.push({
				name: "--rh",
				value: `${rh}px`,
			});
			vars.push({
				name: "--canvas-w",
				value: `${height - value}px`,
			});
		} else {
			vars.push({ name: `--${name}`, value });
		}
	};
	const savedGrid = SettingsManager.getSelf().getConfigs([
		"columns",
		"offcolumns",
		"rows",
		"offrows",
	]);

	if (!properties) {
		Object.entries(savedGrid).forEach(([name, value]) =>
			updateGridVariable(name, value),
		);
	} else {
		properties.forEach((property) => {
			if (property.value !== savedGrid[property.name as keyof GridInfo]) {
				savedGrid[property.name as keyof GridInfo] = property.value;
				updateGridVariable(property.name, property.value);
			}
		});
	}

	setStyle(vars);
}
