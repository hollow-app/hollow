import { Accessor, createMemo, For } from "solid-js";
import Tag from "../../components/Tag";
import { Clock8Icon } from "lucide-solid";
import { TagType } from "@type/hollow";
import { KanbanItemType } from "./KanbanItemType";
import { Show } from "solid-js";
import { timeDifferenceMin } from "@managers/manipulation/strings";

type KanbanItemMiniProps = {
	item: () => KanbanItemType;
	hollowTags: Accessor<TagType[]>;
	parentWidth: () => string;
};
export default function KanbanItemMini({
	item,
	hollowTags,
	parentWidth,
}: KanbanItemMiniProps) {
	const tagColors = createMemo(() => {
		const tags = item().tags;
		return tags.map((tag) => {
			const target = hollowTags().find((i) => i.name === tag);
			return {
				tag,
				background: target?.background ?? "var(--color-secondary-95)",
				foreground: target?.foreground ?? "var(--color-secondary)",
			};
		});
	});

	return (
		<div
			class="group border-secondary-10 bg-secondary relative box-border h-fit rounded-xl border text-black shadow-md transition-colors dark:text-white"
			style={{
				"line-height": "normal",
				width: parentWidth(),
			}}
		>
			<div class="">
				<p class="border-secondary-10 truncate border-b border-dashed p-3 text-sm">
					<span class="text-neutral-500">Title: </span>
					{item().title}
				</p>
				<p class="p-3 text-sm">{item().content}</p>
				<Show when={item().tags.length > 0}>
					<div
						class="flex flex-wrap gap-1.5 px-3"
						style={{
							"font-size": "0.8rem",
						}}
					>
						<For each={tagColors()}>
							{(tagData) => (
								<Tag
									tag={() => tagData.tag}
									background={() => tagData.background}
								/>
							)}
						</For>
					</div>
				</Show>
				<div class="flex items-center px-3 pt-5 pb-3">
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
								stroke-dashoffset={100 - item().progress}
								stroke-linecap="round"
							></circle>
						</svg>
					</div>
					<span class="pl-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
						{item().progress}%
					</span>
					<span
						class="border-secondary-10 ml-2 border-l pl-2 text-xs font-medium"
						classList={{
							"text-green-400": item().priority === "low",
							"text-yellow-400": item().priority === "medium",
							"text-orange-400": item().priority === "high",
							"text-red-400": item().priority === "urgent",
						}}
					>
						{item().priority}
					</span>

					<div class="ml-auto flex items-center text-neutral-500">
						<Clock8Icon class="size-3" />
						<span class="pl-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
							{timeDifferenceMin(item().dates.createdAt)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
