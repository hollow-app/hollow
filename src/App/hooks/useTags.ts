import { manager } from "@managers/index";
import { TagType } from "@type/hollow";
import { hollow } from "hollow";
import setStyle from "./setStyle";

export default function useTags(tags?: TagType[]) {
	let data: TagType[] = manager.settings.getConfig("custom-tags");
	if (tags) {
		data = tags;
		manager.settings.setConfig("custom-tags", tags);
	}
	hollow.events.emit("tags", data);
	setStyle(
		data.flatMap((i) => [
			{
				name: formatCSSVarName(i.name) + "-bg",
				value: i.background,
			},
			{
				name: formatCSSVarName(i.name) + "-fg",
				value: i.foreground,
			},
		]),
	);
}

export const formatCSSVarName = (name: string) => {
	const sanitized = name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return `--tag-${sanitized}`;
};
