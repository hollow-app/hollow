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
import { For, Show } from "solid-js";
import Sortable from "@components/Sortable";
import { PlusIcon } from "lucide-solid";
import { ItemType } from "../types/ItemType";
import ItemMini from "../components/ItemMini";
import { log } from "console";

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
						background: `color-mix(in oklab, ${state.kanban().accent}, transparent 80%)`,
					}}
				>
					{state.meta().data.extra.emoji}
				</div>
				<h1 class="text-2xl font-medium">{state.kanban().name}</h1>
				<ControlButtons
					{...{
						app: props.card.app,
						addItem: logic.addItem,
						showForm: logic.showForm,
					}}
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
											item={() => item}
											hollowTags={state.hollowTags}
											updateItem={logic.updateItem}
											removeItem={(id: string) => {
												logic.removeItem(id);
											}}
											accentColor={() =>
												state.kanban().accent
											}
											toolEvent={props.card.toolEvent}
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
								<ItemMini
									item={() =>
										state
											.kanban()
											.items.find(
												(i) =>
													i.id == state.activeItem(),
											)
									}
									hollowTags={state.hollowTags}
									parentWidth={() =>
										state.listDiv.scrollWidth
											? `${state.listDiv.scrollWidth}px`
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
						KanbanManager.getSelf().showInsight(
							state.kanban(),
							props.card.app,
						)
					}
				>
					Summary
				</button>
			</div>
		</div>
	);
};

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
