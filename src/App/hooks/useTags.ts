import { TagType } from "@type/hollow";
import setStyle from "./setStyle";
import { useStore } from "../store";

export default function useTags(tags?: TagType[]) {
	const { state, dispatch } = useStore();
	let data: TagType[] = state.settings["custom-tags"];
	if (tags) {
		data = tags;
		dispatch({
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
