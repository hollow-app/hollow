import { formatCSSVarName } from "@hooks/useTags";

type TagProps = {
	tag: string;
	title?: string;
};
export default function Tag(props: TagProps) {
	const color = `var(${formatCSSVarName(props.tag)}, var(--color-secondary-95))`;
	return (
		<span
			class="inline-flex h-fit shrink-0 items-center truncate rounded px-2 py-1 text-xs font-medium select-none"
			style={{
				"--bg": color,
				color: `contrast-color(var(--bg))`,
				background: "var(--bg)",
				"line-height": 1,
			}}
			title={props.title}
		>
			{props.tag}
		</span>
	);
}
