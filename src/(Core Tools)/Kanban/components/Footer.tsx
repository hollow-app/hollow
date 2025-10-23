import { Accessor } from "solid-js";
import { ColumnType } from "../types/ColumnType";
import { createMemo } from "solid-js";

type FooterProps = {
	kanban: Accessor<ColumnType>;
};
export default function Footer({ kanban }: FooterProps) {
	const total = createMemo(() => kanban().items.length);

	const fillPercentage = createMemo(() =>
		kanban().max > 0 ? (total() * 100) / kanban().max : 0,
	);

	const avgProgress = createMemo(() => {
		const items = kanban().items;
		if (items.length === 0) return 0;
		return (
			items.reduce((sum, item) => sum + item.progress, 0) / items.length
		);
	});

	const priorityStats = createMemo(() => {
		const counts = { low: 0, medium: 0, high: 0, urgent: 0 };
		for (const item of kanban().items) {
			if (item.priority) counts[item.priority]++;
		}
		return counts;
	});

	return (
		<div class="border-secondary-05 flex items-center justify-between border-t pt-1 font-mono text-xs text-neutral-500 opacity-0 @min-[10rem]:opacity-100">
			<div class="flex items-center gap-1" title="Total">
				<span>
					{total()} / {kanban().max}
				</span>
				<span>({fillPercentage().toFixed(0)}%)</span>
			</div>
			<div class="flex items-center gap-1" title="avgProgress">
				<span>{avgProgress().toFixed(0)}%</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="flex gap-1">
					<span class="text-green-400">{priorityStats().low}</span>
					<span class="text-yellow-400">
						{priorityStats().medium}
					</span>
					<span class="text-orange-400">{priorityStats().high}</span>
					<span class="text-red-500">{priorityStats().urgent}</span>
				</div>
			</div>
		</div>
	);
}
