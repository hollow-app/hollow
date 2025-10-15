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
import { DataBase, HollowEvent, ICard } from "hollow-api";
import { createMemo, createSignal, For, onCleanup, onMount } from "solid-js";
import { KanbanData } from "./KanbanMain";

import { lazy } from "solid-js";
const Icon = lazy(() => import("@components/Icon"));

type KanbanProps = {
	data: KanbanData;
	db: DataBase;
	card: ICard;
	app: HollowEvent;
};
export default function Kanban({ card, db, data, app }: KanbanProps) {
	let listDiv: HTMLDivElement;
	const [kanban, setKanban] = createSignal(data);
	const [hollowTags, setHollowTags] = createSignal<TagType[]>(
		app.getCurrentData("tags"),
	);
	const percentage = createMemo(
		() => (kanban().items.length * 100) / kanban().max,
	);
	const updateItem = (id: string, value: string) => {
		const values = value.split("#");
		const content = values[0].trim();
		const tags =
			values.length > 1 ? values.slice(1).map((i) => i.trim()) : [];
		setKanban((prev: KanbanData) => ({
			...prev,
			items: prev.items.map((item) =>
				item.id === id
					? {
							...item,
							content: content,
							tags: tags,
						}
					: item,
			),
		}));
		db.putData(card.name, kanban());
		sendEntry({
			id: id,
			content: content,
			tags: tags,
			source: { tool: "kanban", card: card.name },
		});
	};
	const removeItem = (id: string, byItemComponent?: boolean) => {
		setKanban((prev: KanbanData) => ({
			...prev,
			items: prev.items.filter((i) => i.id !== id),
		}));
		db.putData(card.name, kanban());
		byItemComponent && app.emit("remove-entry", id);
	};
	const addItem = () => {
		if (percentage() < 100) {
			const item = {
				id: crypto.randomUUID(),
				content: "new Item",
				tags: [] as string[],
			};
			setKanban((prev: KanbanData) => ({
				...prev,
				items: [...prev.items, item],
			}));
			db.putData(card.name, kanban());
			sendEntry({
				...item,
				source: { card: card.name, tool: "kanban" },
			});
		}
	};
	const sendEntry = (entry: EntryData) => {
		app.emit("send-entry", entry);
	};
	const updateHollowTags = (newTags: TagType[]) => {
		setHollowTags(newTags);
	};
	//
	const [activeItem, setActiveItem] = createSignal<string | null>(null);

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
				db.putData(card.name, kanban());
			}
		}
	};
	const setSettingsVisible = () => {
		const settings: ToolOptions = {
			tool: "Kanban",
			card: card.name,
			save: () => {
				db.putData(card.name, kanban());
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
					type: "text",
					label: "Icon",
					description:
						"Change Column Icon (See available icons [Link](https://lucide.dev/icons/link))",
					value: kanban().icon,
					onChange: (v: string) =>
						setKanban((prev) => ({
							...prev,
							icon: v,
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
	const handleReceiveTask = (task: any) => {
		setKanban((prev: KanbanData) => ({
			...prev,
			items: [task, ...prev.items],
		}));
		db.putData(card.name, kanban());
	};
	//
	onMount(() => {
		app.on("tags", updateHollowTags);
		app.on(`kanban-${card.name}-settings`, setSettingsVisible);
		card.toolEvent.on(`${card.name}-receive-task`, handleReceiveTask);
		card.toolEvent.on(`${card.name}-remove-entry`, removeItem);
	});
	onCleanup(() => {
		app.off("tags", updateHollowTags);
		app.off(`kanban-${card.name}-settings`, setSettingsVisible);
		card.toolEvent.off(`${card.name}-receive-task`, handleReceiveTask);
		card.toolEvent.off(`${card.name}-remove-entry`, removeItem);
	});

	return (
		<div
			class="@container relative box-border flex h-full flex-col gap-2 pb-1"
			style={{ "--accent-color": kanban().accent }}
		>
			<div class="mx-2 my-2 box-border flex h-fit shrink-0 items-center gap-3 rounded-lg">
				<div class="flex size-7 items-center justify-center rounded-md">
					<Icon
						name={kanban().icon}
						class="size-full text-neutral-700 dark:text-neutral-300"
					/>
				</div>
				<h1 class="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
					{kanban().name}
				</h1>
				<div
					class={
						"ml-auto hidden items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-300 @min-[10rem]:flex"
					}
					classList={{
						"text-red-500 dark:text-red-400": percentage() > 90,
						"text-neutral-500 dark:text-neutral-400":
							percentage() > 90,
						"animate-pulse": percentage() >= 100,
					}}
					title={`${Math.round(percentage())}% capacity used`}
				>
					<div
						class="size-1.5 rounded-full"
						style={{
							"background-color":
								percentage() > 90
									? "currentColor"
									: "var(--accent-color)",
						}}
					/>
					{Math.round(percentage())}%
				</div>
			</div>
			<div class="box-border w-full flex-1 overflow-hidden overflow-y-auto px-2">
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
											removeItem={removeItem}
											accentColor={() => kanban().accent}
											toolEvent={card.toolEvent}
											cardName={card.name}
											parentWidth={() =>
												`${listDiv.scrollWidth}px`
											}
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
			<div class="from-secondary absolute right-0 bottom-0 left-0 mb-4 bg-gradient-to-t to-transparent px-4 pt-16 opacity-0 @min-[10rem]:opacity-100">
				<button
					class={
						"h-10 w-full items-center justify-center text-neutral-500 transition-all duration-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
					}
					onclick={addItem}
					disabled={percentage() >= 100}
				>
					+ Add Item
				</button>
			</div>
		</div>
	);
}
