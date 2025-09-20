import { Accessor, createMemo, createSignal, For, onMount } from "solid-js";
import Tag from "./Tag";
import { PenLineIcon, GripVerticalIcon } from "lucide-solid";
import TextareaAutosize from "solid-textarea-autosize";
import { TagType } from "@type/TagType";
import { HollowManager } from "@managers/HollowManager";
import { HollowEvent } from "hollow-api";
import { ContextMenuItem, Item } from "@type/ContextMenuItem";
import { ToolMetadata } from "@type/ToolMetadata";
type KanbanItemProps = {
        toolEvent?: HollowEvent;
        cardName?: string;
        item: () => { id: string; content: string; tags: string[] };
        hollowTags: Accessor<TagType[]>;
        updateItem?: (id: string, value: string) => void;
        removeItem?: (id: string, byItemComponent?: boolean) => void;
        isActive?: boolean;
        accentColor: () => string;
        parentWidth: () => string;
};
export default function KanbanItem({
        toolEvent,
        cardName,
        item,
        hollowTags,
        updateItem,
        removeItem,
        isActive,
        accentColor,
        parentWidth,
}: KanbanItemProps) {
        const [editMode, setEditMode] = createSignal(false);
        const [isDragging, setIsDragging] = createSignal(false);

        // Memoize tag lookup
        const tagColors = createMemo(() => {
                const tags = item().tags;
                return tags.map((tag) => {
                        const target = hollowTags().find((i) => i.name === tag);
                        return {
                                tag,
                                background:
                                        target?.background ??
                                        "var(--color-secondary-95)",
                                foreground:
                                        target?.foreground ??
                                        "var(--color-secondary)",
                        };
                });
        });

        const handleContextMenu = () => {
                const metadata: ToolMetadata =
                        toolEvent.getCurrentData("metadata");
                const columns = metadata.cards
                        .filter((i) => i.name !== cardName)
                        .map((i) => {
                                const cmItem: Item = {
                                        icon: "BetweenHorizontalStart",
                                        label: i.name,
                                        onclick: () => {
                                                toolEvent.emit(
                                                        `${i.name}-receive-task`,
                                                        {
                                                                id: item().id,
                                                                content: item()
                                                                        .content,
                                                                tags: item()
                                                                        .tags,
                                                        },
                                                );
                                                removeItem(item().id);
                                        },
                                };
                                return cmItem;
                        });
                const cm: ContextMenuItem = {
                        id: `kanban-item-cm-${item().id}`,
                        header: "Task",
                        items: [
                                {
                                        icon: "Send",
                                        label: "Send",
                                        children: columns,
                                },
                                {
                                        icon: "Trash2",
                                        label: "Delete",
                                        onclick: () =>
                                                removeItem(item().id, true),
                                },
                        ],
                };
                window.hollowManager.emit("context-menu-extend", cm);
        };

        return (
                <div
                        class="group bg-secondary-05 relative box-border h-fit rounded border-2 p-3 transition-colors"
                        style={{
                                "border-color":
                                        isActive || editMode()
                                                ? accentColor()
                                                : "transparent",
                                "line-height": "normal",
                                width: isActive ? parentWidth() : "100%",
                        }}
                        oncontextmenu={handleContextMenu}
                        onmousedown={() => setIsDragging(true)}
                        onmouseup={() => setIsDragging(false)}
                >
                        <div class="absolute top-2 right-2 flex gap-2">
                                <button
                                        onclick={() =>
                                                setEditMode((prev) => !prev)
                                        }
                                        class="text-secondary-50 hover:text-secondary-80 h-5 w-5 rounded-sm opacity-0 transition-opacity group-hover:opacity-100 active:scale-95"
                                >
                                        <PenLineIcon class="m-1 h-4 w-4" />
                                </button>
                        </div>
                        <TextareaAutosize
                                class="my-auto h-fit w-full resize-none overflow-hidden font-bold text-gray-900 dark:text-gray-50"
                                disabled={!editMode()}
                                value={
                                        editMode()
                                                ? `${item().content}${item().tags.length > 0 ? "\n#" : ""}${item().tags.join(" #")}`
                                                : item().content
                                }
                                onchange={(e) =>
                                        updateItem(
                                                item().id,
                                                e.currentTarget.value,
                                        )
                                }
                        />
                        <div
                                class={"mt-2 flex flex-wrap gap-1.5"}
                                classList={{ hidden: editMode() }}
                                style={{
                                        "font-size": "0.8rem",
                                }}
                        >
                                <For each={tagColors()}>
                                        {(tagData) => (
                                                <Tag
                                                        tag={() => tagData.tag}
                                                        background={() =>
                                                                tagData.background
                                                        }
                                                        foreground={() =>
                                                                tagData.foreground
                                                        }
                                                />
                                        )}
                                </For>
                        </div>
                </div>
        );
}
