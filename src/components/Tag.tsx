import { manager } from "@managers/index";
import { TagType } from "@type/hollow";
import { hollow } from "hollow";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

type TagProps = {
	tag: string;
	title?: string;
};
export default function Tag(props: TagProps) {
	const [tag, setTag] = createSignal(
		manager.settings
			.getConfig("custom-tags")
			.find((i) => i.name === props.tag) ?? {
			name: props.tag,
			background: "var(--color-secondary-95)",
		},
	);

	const onUpdate = (tags: TagType[]) => {
		const target = tags.find((i) => i.name === props.tag);
		if (target && target.background !== tag().background) {
			setTag(target);
		}
	};

	onMount(() => {
		hollow.events.on("tags", onUpdate);
	});
	onCleanup(() => {
		hollow.events.off("tags", onUpdate);
	});

	// <span class="">
	// 	{t}
	// </span>
	return (
		<span
			class="inline-flex h-fit shrink-0 items-center truncate rounded-md px-2 py-1 text-xs font-medium select-none"
			style={{
				background: tag().background,
				color: `color-contrast(${tag().background} vs white, black)`,
				"line-height": 1,
			}}
			title={props.title}
		>
			{props.tag}
		</span>
	);
}
