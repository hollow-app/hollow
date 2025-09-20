import { readableColor, lighten, darken } from "polished";
import { Property } from "@type/Property";

export function ShadeIt(name: string, color: string) {
        const isDark = readableColor(color) === "#fff";

        const result: Property[] = [
                {
                        name: `--${name}-rgb`,
                        value: hexToRgb(color),
                },
                {
                        name: `--${name}-color`,
                        value: color,
                },
        ];

        if (isDark) {
                result.push({
                        name: `--${name}-color-05`,
                        value: `${lighten(0.05, color)}`,
                });
                for (let i = 10; i <= 95; i += 5) {
                        result.push({
                                name: `--${name}-color-${i}`,
                                value: `${lighten(i / 100, color)}`,
                        });
                }
        } else {
                result.push({
                        name: `--${name}-color-05`,
                        value: `${darken(0.05, color)}`,
                });
                for (let i = 10; i <= 95; i += 5) {
                        result.push({
                                name: `--${name}-color-${i}`,
                                value: `${darken(i / 100, color)}`,
                        });
                }
        }

        return result;
}

function hexToRgb(hex: string) {
        hex = hex.replace(/^#/, "");

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `${r}, ${g}, ${b}`;
}

export function isHexColor(text: string): boolean {
        return /^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(text);
}
