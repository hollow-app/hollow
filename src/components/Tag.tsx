import { formatCSSVarName } from "@hooks/useTags";

type TagProps = {
	tag: string;
	title?: string;
};
export function Tag(props: TagProps) {
	const name = formatCSSVarName(props.tag);
	const bg = `var(${name + "-bg"}, var(--color-secondary-95))`;
	const fg = `var(${name + "-fg"}, var(--color-secondary))`;
	return (
		<span
			class="inline-flex h-fit shrink-0 items-center truncate rounded px-2 py-1 text-xs font-medium select-none"
			style={{
				color: fg,
				background: bg,
				"line-height": 1,
			}}
			title={props.title}
		>
			{props.tag}
		</span>
	);
}
