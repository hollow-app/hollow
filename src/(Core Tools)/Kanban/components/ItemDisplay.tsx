import { Show, For, JSX } from "solid-js";
import Tag from "../../../components/Tag";
import { Clock8Icon } from "lucide-solid";
import { ItemType } from "../types/ItemType";
import { timeDifferenceMin } from "@utils/manipulation/strings";

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
			class={`group bg-card text-card-foreground bg-secondary-05 relative flex flex-col gap-2 rounded-lg border-2 p-3 shadow-sm transition-all hover:shadow-md ${props.containerClass ?? ""}`}
			style={props.containerStyle}
		>
			<div class="bg-secondary-10 flex w-full items-center justify-between gap-2 rounded px-2">
				<div class="flex items-center gap-2">
					{/* Progress Circle & Text */}
					<div class="flex items-center gap-1.5">
						<div class="relative size-3.5">
							<svg
								class="size-full -rotate-90"
								viewBox="0 0 36 36"
							>
								<circle
									cx="18"
									cy="18"
									r="14"
									fill="none"
									class="stroke-secondary-20"
									stroke-width="5"
								/>
								<circle
									cx="18"
									cy="18"
									r="14"
									fill="none"
									class="stroke-secondary-50"
									stroke-width="5"
									stroke-dasharray="100"
									stroke-dashoffset={
										100 - props.item.progress
									}
									stroke-linecap="round"
								/>
							</svg>
						</div>
						<span class="text-muted-foreground text-[11px] font-medium">
							{props.item.progress}%
						</span>
					</div>

					{/* Priority Badge Style */}
					<span
						class="border-secondary-05 h-fit border-x px-2 text-[11px] font-bold tracking-wider uppercase"
						classList={{
							"text-green-500/80": props.item.priority === "low",
							"text-yellow-500/80":
								props.item.priority === "medium",
							"text-orange-500/80":
								props.item.priority === "high",
							"text-red-500/80": props.item.priority === "urgent",
						}}
					>
						{props.item.priority}
					</span>
				</div>

				{/* Time Created */}
				<div class="text-muted-foreground flex items-center gap-1">
					<Clock8Icon class="size-3" />
					<span class="text-[11px]">
						{timeDifferenceMin(props.item.dates.createdAt)}
					</span>
				</div>
			</div>
			{/* Header: Title and Actions */}
			<div class="flex items-start justify-between gap-2">
				<div class="space-y-1">
					<p class="text-sm leading-none font-semibold tracking-normal">
						{props.item.title}
					</p>
					<Show when={props.item.content}>
						<p class="text-xs text-neutral-600 dark:text-neutral-400">
							{props.item.content}
						</p>
					</Show>
				</div>
				<Show when={props.headerContent}>
					<div class="opacity-0 transition-opacity group-hover:opacity-100">
						{props.headerContent}
					</div>
				</Show>
			</div>

			{/* Footer: Metadata */}

			<Show when={props.item.tags.length > 0}>
				<div class="flex flex-wrap items-center gap-1">
					{/* Tags Section */}
					<For each={props.item.tags}>
						{(tag) => <Tag tag={tag} />}
					</For>
				</div>
			</Show>
		</div>
	);
}
