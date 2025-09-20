import { ShadeIt } from "@managers/manipulation/colors";
import { Property } from "@type/Property";
import { readableColor } from "polished";
import setStyle from "./setStyle";

export function useColor(name: string, color?: string) {
        const storageKey = `${window.realmManager.currentRealmId}-color-${name}`;
        const savedData = localStorage.getItem(storageKey);

        let shades: Property[];

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
                window.realmManager.updateColors({ [name]: color });
        } else if (savedData && !color) {
                shades = JSON.parse(savedData).savedShades;
        } else {
                const realm = window.realmManager.getRealmFromId(
                        window.realmManager.currentRealmId,
                );
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
