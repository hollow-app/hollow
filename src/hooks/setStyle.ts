import { Property } from "@type/Property";

export default function setStyle(
	properties: { name: string; value: string }[],
) {
	// console.log(properties);
	let styleEl = document.getElementById("dynamic-styles") as HTMLStyleElement;

	const existingCSS = styleEl.textContent || "";
	const rootMatch = existingCSS.match(/:root\s*{([\s\S]*?)}/);
	const existingProps: Record<string, string> = {};

	if (rootMatch) {
		rootMatch[1].split(";").forEach((line) => {
			const [key, val] = line.split(":").map((s) => s.trim());
			if (key && val) existingProps[key] = val;
		});
	}

	properties.forEach(({ name, value }) => {
		existingProps[name] = value;
	});

	const cssContent = `:root {\n${Object.entries(existingProps)
		.map(([key, val]) => `  ${key}: ${val};`)
		.join("\n")}\n}`;

	styleEl.textContent = cssContent;
}
