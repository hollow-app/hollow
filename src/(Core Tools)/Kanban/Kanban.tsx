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
import { EntryData } from "@type/EntryData";
import { TagType } from "@type/TagType";
import { ToolOptions } from "@type/ToolOptions";
import { FormType, HollowEvent, ICard } from "hollow-api";
import { createMemo, createSignal, For, onCleanup, onMount } from "solid-js";

import { KanbanColumnType } from "./KanbanColumnType";
import { KanbanManager } from "./KanbanManager";
import { KanbanItemType } from "./KanbanItemType";
import { ToolMetadata } from "@type/ToolMetadata";
import { ChevronDownIcon, PlusIcon } from "lucide-solid";

type KanbanProps = {
	data: KanbanColumnType;
	card: ICard;
	app: HollowEvent;
	manager: KanbanManager;
};
export default function Kanban({ card, data, app, manager }: KanbanProps) {
	let listDiv: HTMLDivElement;
	const [kanban, setKanban] = createSignal(data);
	const [activeItem, setActiveItem] = createSignal<string | null>(null);
	const [meta, setMeta] = createSignal(
		(card.toolEvent.getCurrentData("metadata") as ToolMetadata).cards.find(
			(i) => i.name === card.name,
		),
	);
	const percentage = createMemo(
		() => (kanban().items.length * 100) / kanban().max,
	);
	const [hollowTags, setHollowTags] = createSignal<TagType[]>(
		app.getCurrentData("tags"),
	);

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
		if (percentage() < 100) {
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
	const handleReceiveTask = (task: KanbanItemType | KanbanItemType[]) => {
		setKanban((prev: KanbanColumnType) => ({
			...prev,
			items: [...(Array.isArray(task) ? task : [task]), ...prev.items],
		}));
		updateKanban();
	};

	// mini
	const showForm = (onSubmit: (data: any) => void, item?: KanbanItemType) => {
		const form: FormType = {
			id: "kanban-new-item",
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
	const sendEntry = (entry: KanbanItemType) => {
		const entr: EntryData = {
			...entry,
			meta: { ...entry.dates },
			source: { card: card.name, tool: "kanban" },
		};
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
		setMeta(m.cards.find((i) => i.name === card.name));
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
			<div class="box-border w-full flex-1 overflow-hidden overflow-y-auto pt-2">
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
											parentWidth={() =>
												`${listDiv.scrollWidth}px`
											}
											showForm={showForm}
										/>
									</Sortable>
								)}
							</For>
						</SortableProvider>
					</div>
					<DragOverlay>
						<div class="sortable">
							{activeItem() && (
								<KanbanItem
									item={() =>
										kanban().items.find(
											(i) => i.id == activeItem(),
										)
									}
									hollowTags={hollowTags}
									updateItem={updateItem}
									isActive={true}
									accentColor={() => kanban().accent}
									parentWidth={() =>
										listDiv.scrollWidth
											? `${listDiv.scrollWidth}px`
											: "100%"
									}
								/>
							)}
						</div>
					</DragOverlay>
				</DragDropProvider>
			</div>
			{/* Add */}
			<div class="border-secondary-10 border-t pt-1 text-xs text-neutral-500 opacity-0 @min-[10rem]:opacity-100">
				Total: {kanban().items.length} -
			</div>
		</div>
	);
}

type ControlButtonsProps = {
	app: HollowEvent;
	addItem: (item: KanbanItemType) => void;
	showForm: (onSubmit: (data: any) => void, item?: KanbanItemType) => void;
};
function ControlButtons({ app, addItem, showForm }: ControlButtonsProps) {
	const [open, setOpen] = createSignal(false);

	const onNewItem = () => {
		showForm((data) =>
			addItem({
				...data,
				id: crypto.randomUUID(),
				dates: { createdAt: new Date().toISOString() },
			}),
		);
	};

	return (
		<div class="relative ml-auto">
			<button
				class="hover:bg-secondary-10 rounded p-1 active:scale-90"
				onclick={() => setOpen((prev) => !prev)}
			>
				<ChevronDownIcon class="size-4" />
			</button>
			<div
				class="bg-secondary-05 border-secondary-10 absolute z-10 mt-1 h-20 origin-top scale-90 rounded border opacity-0 transition-all"
				classList={{ "opacity-100 scale-100": open() }}
			>
				<button
					class="tool-tip hover:bg-secondary-10 rounded p-1 active:scale-90"
					onclick={onNewItem}
				>
					<span class="tool-tip-content" data-side="left">
						Add Item
					</span>
					<PlusIcon class="size-4" />
				</button>
			</div>
		</div>
	);
}
