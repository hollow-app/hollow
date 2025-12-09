import { Accessor, createMemo, Setter } from "solid-js";
import { PenLineIcon, Trash2Icon } from "lucide-solid";
import { TagType } from "@type/hollow";
import { HollowEvent } from "@type/hollow";
import { ContextMenuItem, ContextMenuItemButton } from "@type/hollow";
import { ToolMetadata } from "@type/ToolMetadata";
import { ItemType } from "../types/ItemType";
import { hollow } from "hollow";
import ItemDisplay from "./ItemDisplay";

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
				icon: Trash2Icon,
				label: "Delete",
				onclick: () => removeItem(item().id, true),
			},
			{
				icon: PenLineIcon,
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
			classList={{ "cursor-pointer select-none": isActive }}
			oncontextmenu={handleContextMenu}
			onclick={(e) => e.ctrlKey && onSelect()}
		>
			<ItemDisplay
				item={item}
				hollowTags={hollowTags}
				containerStyle={{
					"border-color": selected()
						? accentColor()
						: "var(--color-secondary-10)",
				}}
				headerContent={
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
				}
			/>
		</div>
	);
}
