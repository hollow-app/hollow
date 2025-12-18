import { Property } from "@type/Property";

export default function setStyle(properties: Property[]) {
	const root = document.documentElement;

	properties.forEach(({ name, value }) => {
		root.style.setProperty(name, value);
	});
}
