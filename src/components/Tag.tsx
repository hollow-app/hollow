import { readableColor } from "polished";

type TagProps = {
	background: () => string;
	tag: () => string;
	title?: string;
};
export default function Tag({ background, tag, title }: TagProps) {
	return (
		<span
			class="h-fit shrink-0 truncate rounded-sm px-[0.4em] py-[0.3em] select-none"
			style={{
				background: `color-mix(in oklab, ${background()} 15%, transparent)`,
				color: background(),
				"line-height": 1,
			}}
			title={title}
		>
			{tag()}
		</span>
	);
}
