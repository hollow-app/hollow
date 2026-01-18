import { TagType } from "@type/hollow";
import setStyle from "./setStyle";
import { _dispatch } from "@shared/store/effects";
import { getSettingsConfig } from "@managers/Settings/effects";

export default function useTags(tags?: TagType[]) {
	let data: TagType[] = getSettingsConfig("custom-tags") as TagType[];
	if (tags) {
		data = tags;
		_dispatch({
			domain: "settings",
			type: "set-configs",
			configs: { "custom-tags": tags },
		});
	}
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
