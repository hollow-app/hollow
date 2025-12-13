import { Accessor, createMemo, For, JSX, Show } from "solid-js";
import Tag from "../../../components/Tag";
import { Clock8Icon } from "lucide-solid";
import { TagType } from "@type/hollow";
import { ItemType } from "../types/ItemType";
import { timeDifferenceMin } from "@managers/manipulation/strings";

type ItemDisplayProps = {
	item: ItemType;
	headerContent?: JSX.Element;
	containerClass?: string;
	containerStyle?: JSX.CSSProperties;
	showBorderDivider?: boolean;
};

export default function ItemDisplay(props: ItemDisplayProps) {
	return (
		<div
			class={`group bg-secondary-05 relative box-border h-fit w-full rounded-xl border text-black shadow-md transition-colors dark:text-white ${props.containerClass}`}
			style={{
				"line-height": "normal",
				"border-color": "var(--color-secondary-20)",
				...props.containerStyle,
			}}
		>
			<div>
				<div class="border-secondary-15 flex justify-between border-b border-dashed p-2 text-sm">
					<p class="truncate text-lg font-medium">
						{props.item.title}
					</p>
					<Show when={props.headerContent}>
						{props.headerContent}
					</Show>
				</div>
				<p class="p-2 text-xs text-neutral-600 dark:text-neutral-400">
					{props.item.content}
				</p>
				<Show when={props.item.tags.length > 0}>
					<div
						class="flex flex-wrap gap-1.5 px-2"
						style={{
							"font-size": "0.8rem",
						}}
					>
						<For each={props.item.tags}>
							{(tag) => <Tag tag={tag} />}
						</For>
					</div>
				</Show>
				<div class="flex items-center px-2 pt-3 pb-2">
					<div class="relative size-3">
						<svg
							class="size-full -rotate-90"
							viewBox="0 0 36 36"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle
								cx="18"
								cy="18"
								r="14"
								fill="none"
								class="text-secondary-20 stroke-current"
								stroke-width="6"
							></circle>
							<circle
								cx="18"
								cy="18"
								r="14"
								class="text-secondary-50 stroke-current"
								fill="none"
								stroke-width="6"
								stroke-dasharray="100"
								stroke-dashoffset={100 - props.item.progress}
								stroke-linecap="round"
							></circle>
						</svg>
					</div>
					<span class="pl-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
						{props.item.progress}%
					</span>
					<span
						class="border-secondary-10 ml-2 border-l pl-2 text-xs font-medium"
						classList={{
							"text-green-400": props.item.priority === "low",
							"text-yellow-400": props.item.priority === "medium",
							"text-orange-400": props.item.priority === "high",
							"text-red-400": props.item.priority === "urgent",
						}}
					>
						{props.item.priority}
					</span>

					<div class="ml-auto flex items-center text-neutral-500">
						<Clock8Icon class="size-3" />
						<span class="pl-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
							{timeDifferenceMin(props.item.dates.createdAt)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
