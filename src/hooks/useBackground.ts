import { Property } from "@type/Property";
import setStyle from "./setStyle";
import { RealmManager } from "@managers/RealmManager";

export function useBackground(pack: { path?: string; opacity?: string }) {
	const key = `${RealmManager.getSelf().currentRealmId}-canvas-bg`;
	const savedData = localStorage.getItem(key);

	const vars: Property[] = [];

	if (pack.path || pack.opacity) {
		pack.path &&
			vars.push({
				name: "--canvas-bg-image",
				value: pack.path,
			});
		pack.opacity &&
			vars.push({
				name: "--canvas-bg-opacity",
				value: pack.opacity,
			});
		const parsedData = JSON.parse(savedData);
		localStorage.setItem(
			key,
			JSON.stringify({
				...parsedData,
				...pack,
			}),
		);
	} else if (savedData) {
		const parsedData = JSON.parse(savedData);
		vars.push({
			name: "--canvas-bg-image",
			value: parsedData.path,
		});
		vars.push({
			name: "--canvas-bg-opacity",
			value: parsedData.opacity,
		});
	} else {
		localStorage.setItem(
			key,
			JSON.stringify({
				path: 'url("")',
				opacity: "0.5",
				name: null,
			}),
		);
		vars.push({
			name: "--canvas-bg-image",
			value: 'url("")',
		});
		vars.push({
			name: "--canvas-bg-opacity",
			value: "0.5",
		});
	}
	setStyle(vars);
}
