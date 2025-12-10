import { KanbanProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { ItemType } from "../types/ItemType";
import { ColumnType } from "../types/ColumnType";
import { KanbanManager } from "../KanbanManager";
import {
	ContextMenuItem,
	ContextMenuItemButton,
	FormType,
	ToolOptions,
} from "@type/hollow";
import { lazy, onCleanup, onMount } from "solid-js";
import { ToolMetadata } from "@type/ToolMetadata";
import { DragEventHandler } from "@thisbeyond/solid-dnd";
import {
	ChartGantt,
	ChartGanttIcon,
	ChartNoAxesGantt,
	CheckCheckIcon,
	SendIcon,
	Trash2Icon,
	XIcon,
} from "lucide-solid";
import { hollow } from "hollow";

export type LogicType = {
	handleContextMenu: () => void;
	addItem: (item: ItemType) => void;
	showForm: (onSubmit: (data: any) => void, item?: ItemType) => void;
	onDragStart: DragEventHandler;
	onDragEnd: DragEventHandler;
	updateItem: (item: ItemType) => void;
	removeItem: (id: string) => void;
};

export const KanbanLogic = (
	state: StateType,
	props: KanbanProps,
	helper?: HelperType,
): LogicType => {
	// Items Management
	const updateItem = (item: ItemType) => {
		state.setKanban((prev: ColumnType) => ({
			...prev,
			items: prev.items.map((i) => (i.id === item.id ? item : i)),
		}));
		updateKanban();
	};
	const removeItem = (id: string) => {
		state.setKanban((prev: ColumnType) => ({
			...prev,
			items: prev.items.filter((i) => i.id !== id),
		}));
		updateKanban();
	};
	const addItem = (item: ItemType) => {
		if (state.kanban().items.length / state.kanban().max < 1) {
			state.setKanban((prev: ColumnType) => ({
				...prev,
				items: [...prev.items, item],
			}));
			updateKanban();
		}
	};

	// Dnd

	const onDragStart: DragEventHandler = ({ draggable }) =>
		state.setActiveItem(String(draggable.id));

	const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
		if (draggable && droppable) {
			const currentItems = state.kanban().items;
			const fromIndex = currentItems.findIndex(
				(item) => item.id === String(draggable.id),
			);
			const toIndex = currentItems.findIndex(
				(item) => item.id === String(droppable.id),
			);
			if (fromIndex !== toIndex) {
				const updatedItems = [...currentItems];
				updatedItems.splice(
					toIndex,
					0,
					updatedItems.splice(fromIndex, 1)[0],
				);
				state.setKanban((prev) => ({
					...prev,
					items: [...updatedItems],
				}));
				updateKanban();
			}
		}
	};

	// ess
	const showSettings = () => {
		const settings: ToolOptions = {
			tool: "Kanban",
			card: props.card.data.extra.name,
			save: () => {
				updateKanban();
			},
			options: [
				{
					type: "text",
					label: "Title",
					description: "Change Column Title",
					value: state.kanban().name,
					onAction: (v: string) =>
						state.setKanban((prev) => ({
							...prev,
							name: v,
						})),
				},
				{
					type: "color",
					label: "Accent Color",
					description: "Change The Column's Accent Color",
					value: state.kanban().accent,
					onAction: (c: string) =>
						state.setKanban((prev) => ({
							...prev,
							accent: c,
						})),
				},
				{
					type: "number",
					label: "Max Items",
					description: "Max Number of items",
					value: state.kanban().max,
					onAction: (v: number) =>
						state.setKanban((prev) => ({
							...prev,
							max: v,
						})),
				},
			],
		};
		hollow.events.emit("tool-settings", settings);
	};
	const handleReceiveTask = (tasks: ItemType[]) => {
		state.setKanban((prev: ColumnType) => ({
			...prev,
			items: [...prev.items, ...tasks],
		}));
		updateKanban();
	};

	// mini
	const removeSelected = () => {
		state.setKanban((prev) => ({
			...prev,
			items: prev.items.filter(
				(i) => !state.selectedGroup().includes(i.id),
			),
		}));
	};
	const handleContextMenu = () => {
		if (state.kanban().items.length > 0) {
			const menuItems: ContextMenuItemButton[] = [
				{
					icon: ChartGanttIcon,
					label: "Stats",
					onclick: () =>
						KanbanManager.getSelf().showInsight(state.kanban()),
				},
				{
					icon: CheckCheckIcon,
					label: "Select All",
					onclick: () =>
						state.setSelectedGroup(
							state.kanban().items.map((i) => i.id),
						),
				},
				...(state.selectedGroup().length > 0
					? [
							{
								icon: XIcon,
								label: "UnSelect All",
								onclick: () => state.setSelectedGroup([]),
							},
						]
					: []),
			];
			if (state.selectedGroup().length > 0) {
				const nSelected = state.selectedGroup().length;
				const metadata: ToolMetadata =
					helper?.toolEvents.getData("metadata");
				metadata.cards.some(
					(i) => i.data.extra.name !== props.card.data.extra.name,
				) &&
					menuItems.push({
						icon: SendIcon,
						label: `Send (${nSelected})`,
						children: metadata.cards
							.filter(
								(i) =>
									i.data.extra.name !==
										props.card.data.extra.name &&
									i.data.extra.isPlaced,
							)
							.map((i) => ({
								label: `${i.data.extra.emoji} ${i.data.extra.name}`,
								onclick: () => {
									helper?.toolEvents.emit(
										`${i.data.extra.name}-receive-task`,
										state
											.kanban()
											.items.filter((i) =>
												state
													.selectedGroup()
													.includes(i.id),
											),
									);
									removeSelected();
									updateKanban();
									state.setSelectedGroup([]);
								},
							})),
					});

				menuItems.push({
					icon: Trash2Icon,
					label: `Delete (${nSelected})`,
					onclick: () => {
						hollow.events.emit("confirm", {
							title: "Warning",
							message: `You sure you want to remove (${nSelected}) items`,
							onAccept: () => {
								removeSelected();
								updateKanban();
								state.setSelectedGroup([]);
							},
						});
					},
				});
			}
			const cm: ContextMenuItem = {
				id: `kanban-column-${state.kanban().id}`,
				header: "Kanban",
				items: menuItems,
			};
			hollow.events.emit("context-menu-extend", cm);
		}
	};
	const showForm = (onSubmit: (data: any) => void, item?: ItemType) => {
		const form: FormType = {
			id: item?.id ?? crypto.randomUUID(),
			title: "New Item",
			update: !!item,
			options: [
				{
					key: "title",
					type: "text",
					label: "Title",
					attributes: { placeholder: "Enter Title" },
					inline: true,
					value: item?.title ?? "",
				},
				{
					key: "priority",
					type: "dropdown",
					label: "Priority",
					inline: true,
					options: [
						{
							items: ["low", "medium", "high", "urgent"],
						},
					],
					value: item?.priority ?? "medium",
				},
				{
					key: "content",
					type: "longtext",
					label: "Content",
					attributes: {
						placeholder: "Enter Content",
					},
					value: item?.content ?? "",
				},
				{
					key: "progress",
					type: "range",
					label: "Progress",
					row: true,
					min: 0,
					max: 100,
					value: item?.progress ?? 0,
				},
				{
					key: "tags",
					type: "keywords",
					label: "Tags",
					placeholder: "Enter tags",
					value: item?.tags ?? [],
				},
			],
			submit: onSubmit,
		};
		hollow.events.emit("form", form);
	};
	const updateKanban = () => {
		KanbanManager.getSelf().saveColumn(state.kanban());
	};
	//
	const updateMeta = (m: ToolMetadata) => {
		const t = m.cards.find(
			(i) => i.data.extra.name === props.card.data.extra.name,
		);
		if (t) {
			state.setMeta(t);
		}
	};
	onMount(() => {
		helper?.toolEvents.on(`${props.card.id}-settings`, showSettings);
		helper?.toolEvents.on(
			`${props.card.data.extra.name}-receive-task`,
			handleReceiveTask,
		);
		helper?.toolEvents.on("metadata", updateMeta);
	});
	onCleanup(() => {
		helper?.toolEvents.off(`${props.card.id}-settings`, showSettings);
		helper?.toolEvents.off(
			`${props.card.data.extra.name}-receive-task`,
			handleReceiveTask,
		);
		helper?.toolEvents.off("metadata", updateMeta);
	});
	return {
		handleContextMenu,
		addItem,
		showForm,
		onDragEnd,
		onDragStart,
		updateItem,
		removeItem,
	};
};
