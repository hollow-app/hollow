import KanbanItem from "@coretools/Kanban/KanbanItem";
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
	HollowEvent,
	ICard,
	ToolOptions,
	TagType,
	EntryType,
	AppEvents,
} from "@type/hollow";
import {
	Accessor,
	createMemo,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";

import { KanbanColumnType } from "./KanbanColumnType";
import { KanbanManager } from "./KanbanManager";
import { KanbanItemType } from "./KanbanItemType";
import { ToolMetadata } from "@type/ToolMetadata";
import { PlusIcon } from "lucide-solid";
import KanbanItemMini from "./KanbanItemMini";

type KanbanProps = {
	data: KanbanColumnType;
	card: ICard;
	app: HollowEvent<AppEvents>;
	manager: KanbanManager;
};
export default function Kanban({ card, data, app, manager }: KanbanProps) {
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
		app.getCurrentData("tags"),
	);

	const footer = createMemo(() => {
		const total = kanban().items.length;
		const avgPercentage =
			total !== 0
				? kanban().items.reduce((a, c) => c.progress + a, 0) / total
				: 0;
		return `Total: ${total} (${(total * 100) / kanban().max}%) | avgProgress: ${avgPercentage}%`;
	});

	// Items Management
	const updateItem = (item: KanbanItemType) => {
		setKanban((prev: KanbanColumnType) => ({
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
		setKanban((prev: KanbanColumnType) => ({
			...prev,
			items: prev.items.filter((i) => i.id !== id),
		}));
		updateKanban();
	};
	const addItem = (item: KanbanItemType) => {
		if (kanban().items.length / kanban().max < 1) {
			setKanban((prev: KanbanColumnType) => ({
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
					onChange: (v: string) =>
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
					onChange: (c: string) =>
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
					onChange: (v: number) =>
						setKanban((prev) => ({
							...prev,
							max: v,
						})),
				},
			],
		};
		app.emit("tool-settings", settings);
	};
	const handleReceiveTask = (tasks: KanbanItemType[]) => {
		setKanban((prev: KanbanColumnType) => ({
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
							.filter((i) => i.name !== card.name)
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
						app.emit("confirm", {
							type: "Warning",
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
			app.emit("context-menu-extend", cm);
		}
	};
	const showForm = (onSubmit: (data: any) => void, item?: KanbanItemType) => {
		const form: FormType = {
			id: item?.id ?? crypto.randomUUID(),
			title: "New Item",
			update: !!item,
			options: [
				{
					key: "title",
					type: "text",
					label: "Title",
					placeholder: "Enter Title",
					value: item?.title ?? "",
				},
				{
					key: "content",
					type: "longtext",
					label: "Content",
					placeholder: "Enter Content",
					value: item?.content ?? "",
				},
				{
					key: "priority",
					type: "dropdown",
					label: "Priority",
					options: ["low", "medium", "high", "urgent"],
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
		app.emit("form", form);
	};
	const updateKanban = () => {
		manager.saveColumn(kanban());
	};
	const sendEntry = (e: KanbanItemType | KanbanItemType[]) => {
		const entries = Array.isArray(e) ? e : [e];
		const entr: EntryType[] = entries.map((entry: KanbanItemType) => ({
			...entry,
			meta: {
				...entry.dates,
				progress: `${entry.progress}%`,
				priority: entry.priority,
			},
			source: { card: card.name, tool: "kanban" },
		}));
		app.emit("send-entry", entr);
	};
	const removeEntry = (id: string) => {
		app.emit("remove-entry", id);
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
		app.on("tags", updateHollowTags);
		app.on(`kanban-${card.name}-settings`, showSettings);
		card.toolEvent.on(`${card.name}-receive-task`, handleReceiveTask);
		card.toolEvent.on(`${card.name}-remove-entry`, removeItem);
		card.toolEvent.on("metadata", updateMeta);
	});
	onCleanup(() => {
		app.off("tags", updateHollowTags);
		app.off(`kanban-${card.name}-settings`, showSettings);
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
				<ControlButtons {...{ app, addItem, showForm }} />
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
								<KanbanItemMini
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
			<Footer kanban={kanban} />
		</div>
	);
}

type ControlButtonsProps = {
	addItem: (item: KanbanItemType) => void;
	showForm: (onSubmit: (data: any) => void, item?: KanbanItemType) => void;
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

type FooterProps = {
	kanban: Accessor<KanbanColumnType>;
};
function Footer({ kanban }: FooterProps) {
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
