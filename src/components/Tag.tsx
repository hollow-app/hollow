import { SettingsManager } from "@managers/SettingsManager";
import { TagType } from "@type/hollow";
import { hollow } from "hollow";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

type TagProps = {
	tag: string;
	title?: string;
};
export default function Tag(props: TagProps) {
	const [tag, setTag] = createSignal(
		SettingsManager.getSelf()
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

	return (
		<span
			class="h-fit shrink-0 truncate rounded-sm px-[0.4em] py-[0.3em] select-none"
			style={{
				background: `color-mix(in oklab, ${tag().background} 15%, transparent)`,
				color: tag().background,
				"line-height": 1,
			}}
			title={props.title}
		>
			{props.tag}
		</span>
	);
}
