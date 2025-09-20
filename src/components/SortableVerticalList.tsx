import { NoteType } from "@coretools/NoteBook/NotebookMain";
import {
        closestCenter,
        DragDropProvider,
        DragDropSensors,
        DragOverlay,
        SortableProvider,
} from "@thisbeyond/solid-dnd";
import { TagType } from "@type/TagType";
import { createSignal, For } from "solid-js";
import Sortable from "./Sortable";
import Tag from "./Tag";

type SortableVerticalListProps = {
        items: () => NoteType[];
        setItems: (items: NoteType[]) => void;
        hollowTags: () => TagType[];
        setExpand: (b: boolean) => void;
        setSelected: (id: string) => void;
};

// SortableItem Component
const SortableItem = ({
        item,
        hollowTags,
        setSelected,
        setExpand,
        width,
}: {
        item: NoteType;
        hollowTags: () => TagType[];
        setSelected: (id: string) => void;
        setExpand: (b: boolean) => void;
        width?: number;
}) => {
        return (
                <div
                        class="bg-secondary-05 hover:border-secondary-15 active:border-primary border-secondary-05 flex cursor-pointer flex-col gap-2 overflow-hidden rounded border-1 p-2 transition-all"
                        onclick={() => {
                                setSelected(item.id);
                                setExpand(false);
                        }}
                        style={{
                                width: width ? `${width}px` : "100%",
                        }}
                >
                        <h1 class="w-full overflow-hidden text-start text-lg font-bold text-ellipsis whitespace-nowrap text-gray-900 dark:text-gray-50">
                                {item.title}
                        </h1>
                        <div class="flex flex-wrap gap-1 text-[0.7em]">
                                {item.tags.length > 0 && (
                                        <For
                                                each={
                                                        item.tags.length > 3
                                                                ? item.tags.slice(
                                                                          0,
                                                                          3,
                                                                  )
                                                                : item.tags
                                                }
                                        >
                                                {(tag) => {
                                                        const target =
                                                                hollowTags().find(
                                                                        (t) =>
                                                                                t.name ===
                                                                                tag,
                                                                );
                                                        return (
                                                                <Tag
                                                                        tag={() =>
                                                                                tag
                                                                        }
                                                                        background={() =>
                                                                                target?.background ??
                                                                                "var(--color-secondary-95)"
                                                                        }
                                                                        foreground={() =>
                                                                                target?.foreground ??
                                                                                "var(--color-secondary)"
                                                                        }
                                                                />
                                                        );
                                                }}
                                        </For>
                                )}
                                {item.tags.length > 3 && (
                                        <Tag
                                                tag={() =>
                                                        `+ ${item.tags.length - 3}`
                                                }
                                                background={() =>
                                                        "var(--color-secondary-20)"
                                                }
                                                foreground={() =>
                                                        "var(--color-secondary-80)"
                                                }
                                        />
                                )}
                        </div>
                </div>
        );
};

// Main SortableVerticalList Component
export const SortableVerticalList = ({
        items,
        setItems,
        hollowTags,
        setExpand,
        setSelected,
}: SortableVerticalListProps) => {
        const [activeItem, setActiveItem] = createSignal<string | null>(null);

        const onDragStart = ({ draggable }) => setActiveItem(draggable.id);

        const onDragEnd = ({ draggable, droppable }) => {
                if (draggable && droppable) {
                        const currentItems = items();
                        const fromIndex = currentItems.findIndex(
                                (item) => item.id === draggable.id,
                        );
                        const toIndex = currentItems.findIndex(
                                (item) => item.id === droppable.id,
                        );
                        if (fromIndex !== toIndex) {
                                const updatedItems = [...currentItems];
                                updatedItems.splice(
                                        toIndex,
                                        0,
                                        updatedItems.splice(fromIndex, 1)[0],
                                );
                                setItems(updatedItems);
                        }
                }
        };

        let listDiv: HTMLDivElement;

        return (
                <DragDropProvider
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        collisionDetector={closestCenter}
                >
                        <DragDropSensors />
                        <div
                                ref={listDiv}
                                class="column flex flex-col gap-2 self-stretch"
                        >
                                <SortableProvider
                                        ids={items().map((item) => item.id)}
                                >
                                        <For each={items()}>
                                                {(item: NoteType) => (
                                                        <Sortable id={item.id}>
                                                                <SortableItem
                                                                        item={
                                                                                item
                                                                        }
                                                                        hollowTags={
                                                                                hollowTags
                                                                        }
                                                                        setSelected={
                                                                                setSelected
                                                                        }
                                                                        setExpand={
                                                                                setExpand
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
                                                <SortableItem
                                                        item={
                                                                items().find(
                                                                        (
                                                                                i: NoteType,
                                                                        ) =>
                                                                                i.id ===
                                                                                activeItem(),
                                                                )!
                                                        }
                                                        hollowTags={hollowTags}
                                                        setSelected={
                                                                setSelected
                                                        }
                                                        setExpand={setExpand}
                                                        width={
                                                                listDiv.scrollWidth
                                                        }
                                                />
                                        )}
                                </div>
                        </DragOverlay>
                </DragDropProvider>
        );
};
