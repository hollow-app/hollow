import KanbanItem from "@coretools/Kanban/components/Item";
import { KanbanProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import { KanbanManager } from "../KanbanManager";
import {
	closestCenter,
	DragDropProvider,
	DragDropSensors,
	DragOverlay,
	SortableProvider,
} from "@thisbeyond/solid-dnd";
import { createSignal, For, Show } from "solid-js";
import Sortable from "@components/Sortable";
import { CirclePlusIcon, EllipsisVerticalIcon, Mouse } from "lucide-solid";
import { ItemType } from "../types/ItemType";
import ItemDisplay from "../components/ItemDisplay";
import Floater from "@utils/Floater";
import { ColumnType } from "../types/ColumnType";

export const KanbanView = (
	state: StateType,
	logic: LogicType,
	props: KanbanProps,
	helper?: HelperType,
) => {
	return (
		<div
			class="@container relative box-border flex h-full flex-col gap-2 p-3"
			style={{ "--accent-color": state.kanban().accent }}
			onContextMenu={logic.handleContextMenu}
		>
			{/* Bar */}
			<div class="box-border flex h-fit shrink-0 items-center gap-3">
				<div
					class="flex size-8 items-center justify-center rounded-lg text-xl"
					style={{
						background: `color-mix(in oklab, var(--accent-color), transparent 80%)`,
					}}
				>
					{state.meta().data.extra.emoji}
				</div>
				<h1 class="text-lg font-medium">{state.kanban().name}</h1>
				<ControlButtons
					addItem={logic.addItem}
					showForm={logic.showForm}
					kanban={state.kanban()}
				/>
			</div>
			{/* List */}
			<div class="scrollbar-hidden box-border w-full flex-1 overflow-hidden overflow-y-auto pt-2">
				<DragDropProvider
					onDragStart={logic.onDragStart}
					onDragEnd={logic.onDragEnd}
					collisionDetector={closestCenter}
				>
					<DragDropSensors />
					<div
						ref={state.listDiv}
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
											hollowTags={state.hollowTags}
											updateItem={logic.updateItem}
											removeItem={(id: string) => {
												logic.removeItem(id);
											}}
											accentColor={state.kanban().accent}
											toolEvent={helper?.toolEvents}
											cardName={
												props.card.data.extra.name
											}
											showForm={logic.showForm}
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
									item={state
										.kanban()
										.items.find(
											(i) => i.id == state.activeItem(),
										)}
									hollowTags={state.hollowTags}
									showBorderDivider={false}
									containerStyle={{
										width: state.listDiv.scrollWidth
											? `${state.listDiv.scrollWidth}px`
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
	kanban: ColumnType;
};
function ControlButtons(props: ControlButtonsProps) {
	let parent!: HTMLDivElement;
	const onNewItem = () => {
		props.showForm((data) =>
			props.addItem({
				...data,
				dates: { createdAt: new Date().toISOString() },
			}),
		);
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
