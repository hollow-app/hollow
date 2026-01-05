import { Component, For, Show } from "solid-js";
import {
	closestCenter,
	DragDropProvider,
	DragDropSensors,
	DragOverlay,
	SortableProvider,
} from "@thisbeyond/solid-dnd";
import { CirclePlusIcon, EllipsisVerticalIcon } from "lucide-solid";
import { hollow } from "hollow";
import KanbanItem from "@coretools/Kanban/components/Item";
import Sortable from "@components/Sortable";
import ItemDisplay from "../components/ItemDisplay";
import { ItemType } from "../types/ItemType";
import { useKanban, KanbanProps } from "./hooks";

const Kanban: Component<KanbanProps> = (props) => {
	const { state, actions } = useKanban(props);

	return (
		<div
			class="@container relative box-border flex h-full flex-col gap-1 p-3"
			style={{ "--accent-color": state.kanban().accent }}
			onContextMenu={actions.handleContextMenu}
		>
			{/* Bar */}
			<div class="box-border flex h-fit shrink-0 items-center gap-3">
				<div
					class="flex size-8 items-center justify-center rounded-lg text-xl"
					style={{
						background: `color-mix(in oklab, var(--accent-color), transparent 80%)`,
					}}
				>
					{state.meta()?.data.emoji}
				</div>
				<h1 class="text-lg font-medium">{state.kanban().name}</h1>
				<ControlButtons
					addItem={actions.addItem}
					showForm={actions.showForm}
					kanban={state.kanban()}
				/>
			</div>
			{/* List */}
			<div class="scrollbar-hidden box-border w-full flex-1 overflow-hidden overflow-y-auto pt-2">
				<DragDropProvider
					onDragStart={actions.onDragStart}
					onDragEnd={actions.onDragEnd}
					collisionDetector={closestCenter}
				>
					<DragDropSensors />
					<div
						ref={state.setListDiv}
						class="column flex w-full flex-col gap-3 pb-24"
					>
						<SortableProvider
							ids={state.kanban().items.map((item) => item.id)}
						>
							<For each={state.kanban().items}>
								{(item) => (
									<Sortable id={item.id}>
										<KanbanItem
											item={item}
											updateItem={actions.updateItem}
											removeItem={(id: string) => {
												actions.removeItem(id);
											}}
											accentColor={state.kanban().accent}
											toolEvent={state.toolEvents}
											cardName={props.card.data.name}
											showForm={actions.showForm}
											selectedGroup={state.selectedGroup}
											setSelectedGroup={
												state.setSelectedGroup
											}
										/>
									</Sortable>
								)}
							</For>
						</SortableProvider>
					</div>
					<DragOverlay>
						<div class="sortable">
							<Show when={state.activeItem()}>
								<ItemDisplay
									item={
										state
											.kanban()
											.items.find(
												(i) =>
													i.id == state.activeItem(),
											)!
									}
									showBorderDivider={false}
									containerStyle={{
										width: state.listDiv()?.scrollWidth
											? `${state.listDiv()!.scrollWidth}px`
											: "100%",
										"border-color": state.kanban().accent,
									}}
								/>
							</Show>
						</div>
					</DragOverlay>
				</DragDropProvider>
			</div>
		</div>
	);
};

type ControlButtonsProps = {
	addItem: (item: ItemType) => void;
	showForm: (onSubmit: (data: any) => void, item?: ItemType) => void;
	kanban: any;
};

function ControlButtons(props: ControlButtonsProps) {
	let parent!: HTMLDivElement;
	const onNewItem = () => {
		props.showForm((data) => {
			hollow.events.emit(
				"character-add-achievement",
				"🧩 Task Initiator",
			);
			props.addItem({
				...data,
				dates: { createdAt: new Date().toISOString() },
			});
		});
	};

	return (
		<div ref={parent} class="relative ml-auto flex gap-1">
			<button
				class="hover:bg-secondary-10 shrink-0 rounded p-1 active:scale-90"
				onclick={onNewItem}
			>
				<CirclePlusIcon class="size-4" />
			</button>
			<div class="relative">
				<button
					class="hover:bg-secondary-10 shtink-0 rounded p-1 active:scale-90"
					onclick={(e) =>
						parent.dispatchEvent(
							new MouseEvent("contextmenu", {
								bubbles: true,
								cancelable: true,
								button: 2,
								buttons: 2,
								clientX: e.clientX,
								clientY: e.clientY,
							}),
						)
					}
				>
					<EllipsisVerticalIcon class="size-4" />
				</button>
			</div>
		</div>
	);
}

export default Kanban;
