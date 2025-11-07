import { Property } from "@type/Property";

export default function setStyle(
	properties: { name: string; value: string }[],
) {
	const rootStyle = document.documentElement.style;
	properties.forEach(({ name, value }) => {
		rootStyle.setProperty(name, value);
	});
}
