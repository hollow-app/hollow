import { Property } from "@type/Property";

export default function setStyle(
	properties: { name: string; value: string }[],
) {
	let styleEl = document.getElementById("dynamic-styles") as HTMLStyleElement;

	if (!styleEl) {
		styleEl = document.createElement("style");
		styleEl.id = "dynamic-styles";
		document.head.appendChild(styleEl);
	}

	const existingCSS = styleEl.textContent || "";
	const rootMatch = existingCSS.match(/:root\s*{([\s\S]*?)}/);
	const existingProps: Record<string, string> = {};

	if (rootMatch) {
		rootMatch[1].split(";").forEach((line) => {
			const trimmed = line.trim();
			if (!trimmed) return;
			const [key, ...rest] = trimmed.split(":");
			const val = rest.join(":").trim();
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
