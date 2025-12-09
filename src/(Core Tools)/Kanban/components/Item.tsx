import { Accessor, createMemo, Setter } from "solid-js";
import { PenLineIcon, SendIcon, Trash2Icon } from "lucide-solid";
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
	item: ItemType;
	hollowTags: Accessor<TagType[]>;
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
		const metadata: ToolMetadata = props.toolEvent.getData("metadata");
		const columns = metadata.cards
			.filter(
				(i) =>
					i.data.extra.name !== props.cardName &&
					i.data.extra.isPlaced,
			)
			.map((i) => {
				const cmItem: ContextMenuItemButton = {
					label: `${i.data.extra.emoji} ${i.data.extra.name}`,
					onclick: () => {
						props.toolEvent.emit(
							`${i.data.extra.name}-receive-task`,
							[props.item],
						);
						props.removeItem(props.item.id);
					},
				};
				return cmItem;
			});
		const menuItems: any = [
			{
				icon: PenLineIcon,
				label: "Edit",
				onclick: () => {
					props.showForm((data) => {
						props.updateItem({ ...props.item, ...data });
					}, props.item);
				},
			},
			{
				icon: Trash2Icon,
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
		//TODO card.app
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
				hollowTags={props.hollowTags}
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
						<input
							type="checkbox"
							class="checkbox"
							style={{
								"--accent-color": props.accentColor,
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
