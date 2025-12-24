import { readableColor, lighten, darken, getLuminance } from "polished";
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

	const luminance = getLuminance(color);

	const maxShift = isDark ? 1 - luminance : luminance;

	for (let i = 5; i <= 95; i += 5) {
		const scaled = (i / 100) * maxShift;

		result.push({
			name: `--${name}-color-${i === 5 ? "05" : i}`,
			value: isDark ? lighten(scaled, color) : darken(scaled, color),
		});
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
