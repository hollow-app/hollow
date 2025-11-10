import { Property } from "@type/Property";
import setStyle from "./setStyle";
import { RealmManager } from "@managers/RealmManager";
import { SettingsManager } from "@managers/SettingsManager";

export function useBackground(pack: { path?: string; opacity?: string }) {
	const vars: Property[] = [];
	// TODO background at postrealmselection might be showing the bg when loading
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
	} else {
		vars.push({
			name: "--canvas-bg-image",
			value: `url(${SettingsManager.getSelf().getConfig("background-image")})`,
		});
		vars.push({
			name: "--canvas-bg-opacity",
			value: SettingsManager.getSelf().getConfig("background-opacity"),
		});
	}
	setStyle(vars);
}
