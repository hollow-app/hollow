import { Accessor, createMemo, createUniqueId, Setter } from "solid-js";
import { PenLineIcon, SendIcon } from "lucide-solid";
import { TagType } from "@type/hollow";
import { HollowEvent } from "@type/hollow";
import { ContextMenuItem, ContextMenuItemButton } from "@type/hollow";
import { ToolMetadata } from "@type/ToolMetadata";
import { ItemType } from "../types/ItemType";
import { hollow } from "hollow";
import ItemDisplay from "./ItemDisplay";
import { MyIconFun } from "@components/ui/MyIcon";
import Checkbox from "@components/ui/Checkbox";

type ItemProps = {
	toolEvent?: HollowEvent;
	cardName?: string;
	item: ItemType;
	updateItem?: (item: ItemType) => void;
	removeItem?: (id: string, byItemComponent?: boolean) => void;
	isActive?: boolean;
	accentColor: string;
	showForm?: (onSubmit: (data: any) => void, item?: ItemType) => void;
	selectedGroup?: Accessor<string[]>;
	setSelectedGroup?: Setter<string[]>;
};
export default function Item(props: ItemProps) {
	const selected = createMemo(() =>
		props.selectedGroup().includes(props.item.id),
	);
	const onSelect = () => {
		props.setSelectedGroup((prev) =>
			prev.includes(props.item.id)
				? prev.filter((i) => i !== props.item.id)
				: [...prev, props.item.id],
		);
	};
	// context menu
	const handleContextMenu = () => {
		if (props.selectedGroup) {
			const group = props.selectedGroup();
			if (group.length > 0) {
				return;
			}
		}

		const metadata: ToolMetadata = props.toolEvent.getData("metadata");
		const columns = metadata.cards
			.filter((i) => i.data.name !== props.cardName && i.data.isPlaced)
			.map((i) => {
				const cmItem: ContextMenuItemButton = {
					label: `${i.data.emoji} ${i.data.name}`,
					onclick: () => {
						props.toolEvent.emit(`${i.data.name}-receive-task`, [
							props.item,
						]);
						props.removeItem(props.item.id);
					},
				};
				return cmItem;
			});
		const menuItems: any = [
			{
				icon: MyIconFun({ name: "edit-pen-outline" }),
				label: "Edit",
				onclick: () => {
					props.showForm((data) => {
						props.updateItem({ ...props.item, ...data });
					}, props.item);
				},
			},
			{
				icon: MyIconFun({ name: "trash-outline" }),
				label: "Delete",
				onclick: () => props.removeItem(props.item.id, true),
			},
		];
		if (columns.length > 0) {
			menuItems.unshift({
				icon: SendIcon,
				label: "Send",
				children: columns,
			});
		}
		const cm: ContextMenuItem = {
			id: `kanban-item-cm-${props.item.id}`,
			header: "Task",
			items: menuItems,
		};
		hollow.events.emit("context-menu-extend", cm);
	};

	return (
		<div
			classList={{ "cursor-pointer select-none": props.isActive }}
			oncontextmenu={handleContextMenu}
			onclick={(e) => e.ctrlKey && onSelect()}
		>
			<ItemDisplay
				item={props.item}
				containerStyle={{
					"border-color": selected()
						? props.accentColor
						: "var(--color-secondary-10)",
				}}
				headerContent={
					<div
						class="opacity-0 transition-opacity group-hover:opacity-100"
						classList={{
							"opacity-100": props
								.selectedGroup()
								?.includes(props.item.id),
						}}
					>
						<Checkbox checked={selected()} onclick={onSelect} />
					</div>
				}
			/>
		</div>
	);
}
