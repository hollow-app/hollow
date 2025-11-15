import KanbanItem from "@coretools/Kanban/components/Item";
import Sortable from "@components/Sortable";
import {
	closestCenter,
	DragDropProvider,
	DragDropSensors,
	DragOverlay,
	SortableProvider,
	DragEventHandler,
} from "@thisbeyond/solid-dnd";
import {
	ContextMenuItem,
	FormType,
	ICard,
	ToolOptions,
	TagType,
	EntryType,
} from "@type/hollow";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";

import { ColumnType } from "../types/ColumnType";
import { KanbanManager } from "../KanbanManager";
import { ItemType } from "../types/ItemType";
import { ToolMetadata } from "@type/ToolMetadata";
import { PlusIcon } from "lucide-solid";
import ItemMini from "./ItemMini";

type ColumnProps = {
	data: ColumnType;
	card: ICard;
};
export default function Column({ card, data }: ColumnProps) {
	let listDiv: HTMLDivElement;
	const [kanban, setKanban] = createSignal(data);
	const [activeItem, setActiveItem] = createSignal<string | null>(null);
	const [selectedGroup, setSelectedGroup] = createSignal([]);
	const [meta, setMeta] = createSignal(
		(card.toolEvent.getCurrentData("metadata") as ToolMetadata).cards.find(
			(i) => i.name === card.name,
		),
	);

	const [hollowTags, setHollowTags] = createSignal<TagType[]>(
		card.app.getCurrentData("tags"),
	);

	// Items Management
	const updateItem = (item: ItemType) => {
		setKanban((prev: ColumnType) => ({
			...prev,
			items: prev.items.map((i) => (i.id === item.id ? item : i)),
		}));
		updateKanban();
		sendEntry({
			...item,
			dates: {
				...item.dates,
				updatedAt: new Date().toISOString(),
			},
		});
	};
	const removeItem = (id: string) => {
		setKanban((prev: ColumnType) => ({
			...prev,
			items: prev.items.filter((i) => i.id !== id),
		}));
		updateKanban();
	};
	const addItem = (item: ItemType) => {
		if (kanban().items.length / kanban().max < 1) {
			setKanban((prev: ColumnType) => ({
				...prev,
				items: [...prev.items, item],
			}));
			updateKanban();
			sendEntry(item);
		}
	};

	// Dnd

	const onDragStart: DragEventHandler = ({ draggable }) =>
		setActiveItem(String(draggable.id));

	const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
		if (draggable && droppable) {
			const currentItems = kanban().items;
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
				setKanban((prev) => ({
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
			card: card.name,
			save: () => {
				updateKanban();
			},
			options: [
				{
					type: "text",
					label: "Title",
					description: "Change Column Title",
					value: kanban().name,
					onAction: (v: string) =>
						setKanban((prev) => ({
							...prev,
							name: v,
						})),
				},
				{
					type: "color",
					label: "Accent Color",
					description: "Change The Column's Accent Color",
					value: kanban().accent,
					onAction: (c: string) =>
						setKanban((prev) => ({
							...prev,
							accent: c,
						})),
				},
				{
					type: "number",
					label: "Max Items",
					description: "Max Number of items",
					value: kanban().max,
					onAction: (v: number) =>
						setKanban((prev) => ({
							...prev,
							max: v,
						})),
				},
			],
		};
		card.app.emit("tool-settings", settings);
	};
	const handleReceiveTask = (tasks: ItemType[]) => {
		setKanban((prev: ColumnType) => ({
			...prev,
			items: [...prev.items, ...tasks],
		}));
		updateKanban();
		sendEntry(tasks);
	};

	// mini
	const removeSelected = () => {
		setKanban((prev) => ({
			...prev,
			items: prev.items.filter((i) => !selectedGroup().includes(i.id)),
		}));
	};
	const handleContextMenu = () => {
		if (kanban().items.length > 0) {
			const menuItems: any = [
				{
					icon: "CheckCheck",
					label: "Select All",
					onclick: () =>
						setSelectedGroup(kanban().items.map((i) => i.id)),
				},
				...(selectedGroup().length > 0
					? [
							{
								icon: "X",
								label: "UnSelect All",
								onclick: () => setSelectedGroup([]),
							},
						]
					: []),
			];
			if (selectedGroup().length > 0) {
				const nSelected = selectedGroup().length;
				const metadata: ToolMetadata =
					card.toolEvent.getCurrentData("metadata");
				metadata.cards.some((i) => i.name !== card.name) &&
					menuItems.push({
						icon: "Send",
						label: `Send (${nSelected})`,
						children: metadata.cards
							.filter((i) => i.name !== card.name && i.isPlaced)
							.map((i) => ({
								label: `${i.emoji} ${i.name}`,
								onclick: () => {
									card.toolEvent.emit(
										`${i.name}-receive-task`,
										kanban().items.filter((i) =>
											selectedGroup().includes(i.id),
										),
									);
									removeSelected();
									updateKanban();
									setSelectedGroup([]);
								},
							})),
					});

				menuItems.push({
					icon: "Trash2",
					label: `Delete (${nSelected})`,
					onclick: () => {
						card.app.emit("confirm", {
							title: "Warning",
							message: `You sure you want to remove (${nSelected}) items`,
							onAccept: () => {
								removeSelected();
								updateKanban();
								setSelectedGroup([]);
							},
						});
					},
				});
			}
			const cm: ContextMenuItem = {
				id: `kanban-column-${kanban().id}`,
				header: "Kanban",
				items: menuItems,
			};
			card.app.emit("context-menu-extend", cm);
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
					value: item?.title ?? "",
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
					key: "priority",
					type: "dropdown",
					label: "Priority",
					options: [
						{
							items: ["low", "medium", "high", "urgent"],
						},
					],
					value: item?.priority ?? "medium",
				},
				{
					key: "progress",
					type: "range",
					label: "Progress",
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
		card.app.emit("form", form);
	};
	const updateKanban = () => {
		KanbanManager.getSelf().saveColumn(kanban());
	};
	const sendEntry = (e: ItemType | ItemType[]) => {
		const entries = Array.isArray(e) ? e : [e];
		const entr: EntryType[] = entries.map((entry: ItemType) => ({
			...entry,
			meta: {
				...entry.dates,
				progress: `${entry.progress}%`,
				priority: entry.priority,
			},
			source: { card: card.name, tool: "kanban" },
		}));
		card.app.emit("send-entry", entr);
	};
	const removeEntry = (id: string) => {
		card.app.emit("remove-entry", id);
	};
	//
	const updateHollowTags = (newTags: TagType[]) => {
		setHollowTags(newTags);
	};
	const updateMeta = (m: ToolMetadata) => {
		const t = m.cards.find((i) => i.name === card.name);
		if (t) {
			setMeta(t);
		}
	};
	onMount(() => {
		card.app.on("tags", updateHollowTags);
		card.toolEvent.on(`${card.id}-settings`, showSettings);
		card.toolEvent.on(`${card.name}-receive-task`, handleReceiveTask);
		card.toolEvent.on(`${card.name}-remove-entry`, removeItem);
		card.toolEvent.on("metadata", updateMeta);
	});
	onCleanup(() => {
		card.app.off("tags", updateHollowTags);
		card.toolEvent.off(`${card.id}-settings`, showSettings);
		card.toolEvent.off(`${card.name}-receive-task`, handleReceiveTask);
		card.toolEvent.off(`${card.name}-remove-entry`, removeItem);
		card.toolEvent.off("metadata", updateMeta);
	});

	return (
		<div
			class="@container relative box-border flex h-full flex-col gap-2"
			style={{ "--accent-color": kanban().accent }}
			onContextMenu={handleContextMenu}
		>
			{/* Bar */}
			<div class="box-border flex h-fit shrink-0 items-center gap-3">
				<div
					class="flex size-8 items-center justify-center rounded-lg text-xl"
					style={{
						background: `color-mix(in oklab, ${kanban().accent}, transparent 80%)`,
					}}
				>
					{meta().emoji}
				</div>
				<h1 class="text-2xl font-medium">{kanban().name}</h1>
				<ControlButtons {...{ app: card.app, addItem, showForm }} />
			</div>
			{/* List */}
			<div class="scrollbar-hidden box-border w-full flex-1 overflow-hidden overflow-y-auto pt-2">
				<DragDropProvider
					onDragStart={onDragStart}
					onDragEnd={onDragEnd}
					collisionDetector={closestCenter}
				>
					<DragDropSensors />
					<div
						ref={listDiv}
						class="column flex w-full flex-col gap-3 pb-24"
					>
						<SortableProvider
							ids={kanban().items.map((item) => item.id)}
						>
							<For each={kanban().items}>
								{(item) => (
									<Sortable id={item.id}>
										<KanbanItem
											item={() => item}
											hollowTags={hollowTags}
											updateItem={updateItem}
											removeItem={(id) => {
												removeItem(id);
												removeEntry(id);
											}}
											accentColor={() => kanban().accent}
											toolEvent={card.toolEvent}
											cardName={card.name}
											showForm={showForm}
											selectedGroup={selectedGroup}
											setSelectedGroup={setSelectedGroup}
										/>
									</Sortable>
								)}
							</For>
						</SortableProvider>
					</div>
					<DragOverlay>
						<div class="sortable">
							<Show when={activeItem()}>
								<ItemMini
									item={() =>
										kanban().items.find(
											(i) => i.id == activeItem(),
										)
									}
									hollowTags={hollowTags}
									parentWidth={() =>
										listDiv.scrollWidth
											? `${listDiv.scrollWidth}px`
											: "100%"
									}
								/>
							</Show>
						</div>
					</DragOverlay>
				</DragDropProvider>
			</div>
			<div>
				<button
					class="button-secondary"
					style={{ "--w": "100%" }}
					onclick={() =>
						KanbanManager.getSelf().showInsight(kanban(), card.app)
					}
				>
					Summary
				</button>
			</div>
		</div>
	);
}

type ControlButtonsProps = {
	addItem: (item: ItemType) => void;
	showForm: (onSubmit: (data: any) => void, item?: ItemType) => void;
};
function ControlButtons({ addItem, showForm }: ControlButtonsProps) {
	const onNewItem = () => {
		showForm((data) =>
			addItem({
				...data,
				dates: { createdAt: new Date().toISOString() },
			}),
		);
	};

	return (
		<div class="relative ml-auto">
			<button
				class="hover:bg-secondary-10 rounded p-1 active:scale-90"
				onclick={onNewItem}
			>
				<PlusIcon class="size-4" />
			</button>
		</div>
	);
}
