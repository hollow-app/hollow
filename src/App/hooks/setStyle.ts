import { Property } from "@app/type/Property";
import { hollow } from "hollow";
type PropertyObject = { [key: string]: string };
export default function setStyle(properties: Property[]) {
	const vars: PropertyObject = hollow.events.getData("style-update") ?? {};
	hollow.events.emit("style-update", {
		...vars,
		...properties.reduce(
			(acc, curr) => ({ ...acc, [curr.name]: curr.value }),
			{},
		),
	});
	const root = document.documentElement;
	properties.forEach(({ name, value }) => {
		root.style.setProperty(name, value);
	});
}
