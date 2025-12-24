import { ShadeIt } from "@utils/manipulation/colors";
import { Property } from "@type/Property";
import { readableColor } from "polished";
import setStyle from "./setStyle";
import { manager } from "./index";
import { Realm } from "@type/Realm";

type useColorProps = {
	name: string;
	color?: string;
	oneTime?: boolean;
};
export function useColor({ name, color, oneTime }: useColorProps) {
	let shades: Property[];

	if (oneTime) {
		shades = ShadeIt(name, color);
	} else {
		const storageKey = `${RealmManager.getSelf().currentRealmId}-color-${name}`;
		const savedData = localStorage.getItem(storageKey);

		if (savedData && color) {
			const { savedColor, savedShades } = JSON.parse(savedData);

			if (savedColor === color) {
				shades = savedShades;
			} else {
				shades = ShadeIt(name, color);
				localStorage.setItem(
					storageKey,
					JSON.stringify({
						savedColor: color,
						savedShades: shades,
					}),
				);
			}
			RealmManager.getSelf().updateColors({ [name]: color });
		} else if (savedData && !color) {
			shades = JSON.parse(savedData).savedShades;
		} else {
			const realm = RealmManager.getSelf().getCurrent();
			const defaultColor =
				name === "primary"
					? realm.colors.primary
					: realm.colors.secondary;
			shades = ShadeIt(name, defaultColor);
			localStorage.setItem(
				storageKey,
				JSON.stringify({
					savedColor: defaultColor,
					savedShades: shades,
				}),
			);
		}
	}
	if (name === "secondary") {
		switchMode(readableColor(shades[1].value) === "#fff");
	}
	setStyle(shades);
}

function switchMode(isDark: boolean) {
	const currentTheme = localStorage.theme;
	if (
		(isDark && currentTheme !== "dark") ||
		(!isDark && currentTheme === "dark")
	) {
		localStorage.theme = isDark ? "dark" : "light";
		document.documentElement.classList.toggle("dark", isDark);
	}
}
