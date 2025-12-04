import { Accessor, createMemo, For, Setter } from "solid-js";
import Tag from "../../../components/Tag";
import { Clock8Icon } from "lucide-solid";
import { TagType } from "@type/hollow";
import { HollowEvent } from "@type/hollow";
import { ContextMenuItem, ContextMenuItemButton } from "@type/hollow";
import { ToolMetadata } from "@type/ToolMetadata";
import { ItemType } from "../types/ItemType";
import { Show } from "solid-js";
import { timeDifferenceMin } from "@managers/manipulation/strings";
import { hollow } from "hollow";

type ItemProps = {
	toolEvent?: HollowEvent;
	cardName?: string;
	item: () => ItemType;
	hollowTags: Accessor<TagType[]>;
	updateItem?: (item: ItemType) => void;
	removeItem?: (id: string, byItemComponent?: boolean) => void;
	isActive?: boolean;
	accentColor: () => string;
	showForm?: (onSubmit: (data: any) => void, item?: ItemType) => void;
	selectedGroup?: Accessor<string[]>;
	setSelectedGroup?: Setter<string[]>;
};
export default function Item({
	toolEvent,
	cardName,
	item,
	hollowTags,
	updateItem,
	removeItem,
	isActive,
	accentColor,
	showForm,
	selectedGroup,
	setSelectedGroup,
}: ItemProps) {
	const selected = createMemo(() => selectedGroup().includes(item().id));
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
	const onSelect = () => {
		setSelectedGroup((prev) =>
			prev.includes(item().id)
				? prev.filter((i) => i !== item().id)
				: [...prev, item().id],
		);
	};
	// context menu
	const handleContextMenu = () => {
		const metadata: ToolMetadata = toolEvent.getData("metadata");
		const columns = metadata.cards
			.filter(
				(i) => i.data.extra.name !== cardName && i.data.extra.isPlaced,
			)
			.map((i) => {
				const cmItem: ContextMenuItemButton = {
					label: `${i.data.extra.emoji} ${i.data.extra.name}`,
					onclick: () => {
						toolEvent.emit(`${i.data.extra.name}-receive-task`, [
							item(),
						]);
						removeItem(item().id);
					},
				};
				return cmItem;
			});
		const menuItems: any = [
			{
				icon: "Trash2",
				label: "Delete",
				onclick: () => removeItem(item().id, true),
			},
			{
				icon: "PenLine",
				label: "Edit",
				onclick: () => {
					showForm((data) => {
						updateItem({ ...item(), ...data });
					}, item());
				},
			},
		];
		if (columns.length > 0) {
			menuItems.unshift({
				icon: "Send",
				label: "Send",
				children: columns,
			});
		}
		const cm: ContextMenuItem = {
			id: `kanban-item-cm-${item().id}`,
			header: "Task",
			items: menuItems,
		};
		//TODO card.app
		hollow.events.emit("context-menu-extend", cm);
	};

	return (
		<div
			class="group border-secondary-10 bg-secondary relative box-border h-fit w-full rounded-xl border text-black shadow-md transition-colors dark:text-white"
			style={{
				"border-color": selected()
					? accentColor()
					: "var(--color-secondary-10)",
				"line-height": "normal",
			}}
			classList={{ "cursor-pointer select-none": isActive }}
			oncontextmenu={handleContextMenu}
			onclick={(e) => e.ctrlKey && onSelect()}
		>
			<div>
				<div class="border-secondary-10 flex justify-between border-b border-dashed p-3 text-sm">
					<p class="truncate">
						<span class="text-neutral-500">Title: </span>
						{item().title}
					</p>

					<div
						class="opacity-0 transition-opacity group-hover:opacity-100"
						classList={{
							"opacity-100": selectedGroup()?.includes(item().id),
						}}
					>
						<input
							type="checkbox"
							class="checkbox"
							style={{
								"--accent-color": accentColor(),
								"--margin": 0,
							}}
							checked={selected()}
							onclick={onSelect}
						/>
					</div>
				</div>
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
