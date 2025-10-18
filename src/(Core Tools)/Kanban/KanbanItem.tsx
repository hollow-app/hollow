import { Accessor, createMemo, createSignal, For } from "solid-js";
import Tag from "../../components/Tag";
import { Clock8Icon, PenLineIcon } from "lucide-solid";
import { TagType } from "@type/TagType";
import { HollowEvent } from "hollow-api";
import { ContextMenuItem, Item } from "@type/ContextMenuItem";
import { ToolMetadata } from "@type/ToolMetadata";
import { KanbanItemType } from "./KanbanItemType";
import { Show } from "solid-js";
import { timeDifferenceMin } from "@managers/manipulation/strings";

type KanbanItemProps = {
	toolEvent?: HollowEvent;
	cardName?: string;
	item: () => KanbanItemType;
	hollowTags: Accessor<TagType[]>;
	updateItem?: (item: KanbanItemType) => void;
	removeItem?: (id: string, byItemComponent?: boolean) => void;
	isActive?: boolean;
	accentColor: () => string;
	parentWidth: () => string;
	showForm?: (onSubmit: (data: any) => void, item?: KanbanItemType) => void;
};
export default function KanbanItem({
	toolEvent,
	cardName,
	item,
	hollowTags,
	updateItem,
	removeItem,
	isActive,
	accentColor,
	parentWidth,
	showForm,
}: KanbanItemProps) {
	const [editMode, setEditMode] = createSignal(false);
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

	// context menu
	const handleContextMenu = () => {
		const metadata: ToolMetadata = toolEvent.getCurrentData("metadata");
		const columns = metadata.cards
			.filter((i) => i.name !== cardName)
			.map((i) => {
				const cmItem: Item = {
					icon: "BetweenHorizontalStart",
					label: i.name,
					onclick: () => {
						toolEvent.emit(`${i.name}-receive-task`, {
							id: item().id,
							content: item().content,
							tags: item().tags,
						});
						removeItem(item().id);
					},
				};
				return cmItem;
			});
		const cm: ContextMenuItem = {
			id: `kanban-item-cm-${item().id}`,
			header: "Task",
			items: [
				{
					icon: "Send",
					label: "Send",
					children: columns,
				},
				{
					icon: "Trash2",
					label: "Delete",
					onclick: () => removeItem(item().id, true),
				},
			],
		};
		window.hollowManager.emit("context-menu-extend", cm);
	};

	return (
		<div
			class="group bg-secondary relative box-border h-fit rounded-xl border shadow-md transition-colors"
			style={{
				"border-color":
					isActive || editMode()
						? accentColor()
						: "var(--color-secondary-10)",
				"line-height": "normal",
				width: isActive ? parentWidth() : "100%",
			}}
			oncontextmenu={handleContextMenu}
		>
			<div class="absolute top-2.5 right-2 opacity-0 transition-opacity group-hover:opacity-100">
				<input
					type="checkbox"
					class="checkbox"
					style={{ "--accent-color": accentColor() }}
				/>
			</div>
			<div class="">
				<p class="border-secondary-10 truncate border-b border-dashed p-3 text-sm">
					<span class="text-neutral-500">Title: </span>
					{item().title}
				</p>
				<p class="p-3">{item().content}</p>
				<Show when={item().tags.length > 0}>
					<div
						class="flex flex-wrap gap-1.5 px-3"
						classList={{ hidden: editMode() }}
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
								//stroke={accentColor()}
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
