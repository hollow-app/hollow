import { InsightType } from "@type/hollow";
import ScrollIcon from "@assets/icons/note-fill.svg";
import { Accessor, For, Show } from "solid-js";

type InsightPopProps = {
	data: Accessor<InsightType>;
	hide: () => void;
};
export default function InsightPop({ data, hide }: InsightPopProps) {
	function isEscapedItem(index: number): boolean {
		const total = data().items.length;
		const rows = 5;

		const fullColumns = Math.floor(total / rows);
		const leftover = total % rows;

		let redStartIndex: number;

		if (leftover === 0) {
			redStartIndex = (fullColumns - 1) * rows;
		} else {
			redStartIndex = fullColumns * rows;
		}

		return index < redStartIndex;
	}

	return (
		<div class="bg-secondary-05 border-secondary-10 pointer-events-auto fixed right-4 bottom-4 flex max-h-[calc(100%-calc(var(--spacing)*8))] min-w-64 cursor-default flex-col gap-4 rounded-lg border p-3 text-sm shadow-lg select-none">
			{/* Header */}
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<ScrollIcon class="size-4" />
					<span class="text-xs font-semibold">{data().title}</span>
				</div>

				{/* Close button */}
				<button
					class="self-end text-[10px] opacity-50 hover:opacity-80"
					onclick={hide}
				>
					Close
				</button>
			</div>

			{/* Message */}
			<Show when={data().message}>
				<p class="line-clamp-3 text-xs leading-snug opacity-80">
					{data().message}
				</p>
			</Show>

			{/* Short List */}
			<Show when={data().items}>
				<ul class="grid grid-flow-col grid-rows-5 text-xs opacity-90">
					<For each={data().items}>
						{(i, index) => (
							<li
								class="border-secondary-15 flex w-61 border-dashed px-3 py-1.5"
								classList={{
									"tool-tip": !!i.tooltip,
									"border-r": isEscapedItem(index()),
								}}
							>
								<span class="tool-tip-content" data-side="left">
									{i.tooltip}
								</span>
								<span>{i.label}</span>
								<Show when={i.value !== undefined}>
									<span class="ml-auto font-medium">
										{i.value}
									</span>
								</Show>
							</li>
						)}
					</For>
				</ul>
			</Show>
		</div>
	);
}
