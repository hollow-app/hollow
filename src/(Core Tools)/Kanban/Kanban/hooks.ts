import { createSignal, onMount, onCleanup, Accessor, Setter } from "solid-js";
import { DragEventHandler } from "@thisbeyond/solid-dnd";
import { CheckCheckIcon, SendIcon, XIcon } from "lucide-solid";
import { hollow } from "hollow";
import { MyIconFun } from "@components/MyIcon";
import { KanbanManager } from "../KanbanManager";
import { ColumnType } from "../types/ColumnType";
import { ItemType } from "../types/ItemType";
import { CardType, ContextMenuItem, ContextMenuItemButton, FormType, ToolOptions } from "@type/hollow";
import { ToolMetadata } from "@type/ToolMetadata";

export interface KanbanProps {
    data: ColumnType;
    card: CardType;
}

export interface KanbanState {
    listDiv: Accessor<HTMLDivElement | undefined>;
    setListDiv: (el: HTMLDivElement) => void;
    kanban: Accessor<ColumnType>;
    setKanban: Setter<ColumnType>;
    activeItem: Accessor<string | null>;
    setActiveItem: Setter<string | null>;
    selectedGroup: Accessor<string[]>;
    setSelectedGroup: Setter<string[]>;
    meta: Accessor<CardType | undefined>;
    setMeta: Setter<CardType | undefined>;
}

export interface KanbanActions {
    handleContextMenu: () => void;
    addItem: (item: ItemType) => void;
    showForm: (onSubmit: (data: any) => void, item?: ItemType) => void;
    onDragStart: DragEventHandler;
    onDragEnd: DragEventHandler;
    updateItem: (item: ItemType) => void;
    removeItem: (id: string) => void;
}

export interface KanbanHook {
    state: KanbanState;
    actions: KanbanActions;
}

export const useKanban = (props: KanbanProps): KanbanHook => {
    const [listDiv, setListDivSignal] = createSignal<HTMLDivElement>();
    const [kanban, setKanban] = createSignal(props.data);
    const [activeItem, setActiveItem] = createSignal<string | null>(null);
    const [selectedGroup, setSelectedGroup] = createSignal<string[]>([]);

    const toolEvents = KanbanManager.getSelf().getEvents();
    const [meta, setMeta] = createSignal<CardType | undefined>(
        (toolEvents.getData("metadata") as ToolMetadata)?.cards.find(
            (i) => i.data.name === props.card.data.name,
        ),
    );

    const updateKanban = () => {
        KanbanManager.getSelf().saveColumn(kanban());
    };

    const updateItem = (item: ItemType) => {
        setKanban((prev: ColumnType) => ({
            ...prev,
            items: prev.items.map((i) => (i.id === item.id ? item : i)),
        }));
        updateKanban();
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
        }
    };

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
            if (fromIndex !== toIndex && fromIndex !== -1 && toIndex !== -1) {
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
        setActiveItem(null);
    };

    const removeSelected = () => {
        setKanban((prev) => ({
            ...prev,
            items: prev.items.filter(
                (i) => !selectedGroup().includes(i.id),
            ),
        }));
    };

    const handleContextMenu = () => {
        if (kanban().items.length > 0) {
            const menuItems: ContextMenuItemButton[] = [
                {
                    icon: MyIconFun({ name: "menu-board-outline" }),
                    label: "Stats",
                    onclick: () =>
                        KanbanManager.getSelf().showInsight(kanban()),
                },
                {
                    icon: CheckCheckIcon,
                    label: "Select All",
                    onclick: () =>
                        setSelectedGroup(
                            kanban().items.map((i) => i.id),
                        ),
                },
                ...(selectedGroup().length > 0
                    ? [
                        {
                            icon: XIcon,
                            label: "UnSelect All",
                            onclick: () => setSelectedGroup([]),
                        },
                    ]
                    : []),
            ];
            if (selectedGroup().length > 0) {
                const nSelected = selectedGroup().length;
                const metadata: ToolMetadata = toolEvents.getData("metadata");
                metadata.cards.some(
                    (i) => i.data.name !== props.card.data.name,
                ) &&
                    menuItems.push({
                        icon: SendIcon,
                        label: `Send (${nSelected})`,
                        children: metadata.cards
                            .filter(
                                (i) =>
                                    i.data.name !== props.card.data.name &&
                                    i.data.isPlaced,
                            )
                            .map((i) => ({
                                label: `${i.data.emoji} ${i.data.name}`,
                                onclick: () => {
                                    toolEvents.emit(
                                        `${i.data.name}-receive-task`,
                                        kanban()
                                            .items.filter((item) =>
                                                selectedGroup()
                                                    .includes(item.id),
                                            ),
                                    );
                                    removeSelected();
                                    updateKanban();
                                    setSelectedGroup([]);
                                },
                            })),
                    });

                menuItems.push({
                    icon: MyIconFun({ name: "trash-outline" }),
                    label: `Delete (${nSelected})`,
                    onclick: () => {
                        hollow.events.emit("confirm", {
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
            hollow.events.emit("context-menu-extend", cm);
        }
    };

    const showForm = (onSubmit: (data: any) => void, item?: ItemType) => {
        const update = !!item;
        const form: FormType = {
            id: item?.id ?? crypto.randomUUID(),
            title: update ? "Update Item" : "New Item",
            update,
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
                    type: "segmented",
                    label: "Priority",
                    inline: true,
                    options: [
                        { key: "low", title: "low" },
                        { key: "medium", title: "medium" },
                        { key: "high", title: "high" },
                        { key: "urgent", title: "urgent" },
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

    const showSettings = () => {
        const settings: ToolOptions = {
            tool: "Kanban",
            card: props.card.data.name,
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
        hollow.events.emit("tool-settings", settings);
    };

    const handleReceiveTask = (tasks: ItemType[]) => {
        setKanban((prev: ColumnType) => ({
            ...prev,
            items: [...prev.items, ...tasks],
        }));
        updateKanban();
    };

    const updateMeta = (m: ToolMetadata) => {
        const t = m.cards.find((i) => i.data.name === props.card.data.name);
        if (t) {
            setMeta(t);
        }
    };

    onMount(() => {
        toolEvents.on(`${props.card.id}-settings`, showSettings);
        toolEvents.on(
            `${props.card.data.name}-receive-task`,
            handleReceiveTask,
        );
        toolEvents.on("metadata", updateMeta);
    });

    onCleanup(() => {
        toolEvents.off(`${props.card.id}-settings`, showSettings);
        toolEvents.off(
            `${props.card.data.name}-receive-task`,
            handleReceiveTask,
        );
        toolEvents.off("metadata", updateMeta);
    });

    return {
        state: {
            listDiv,
            setListDiv: setListDivSignal,
            kanban,
            setKanban,
            activeItem,
            setActiveItem,
            selectedGroup,
            setSelectedGroup,
            meta,
            setMeta,
        },
        actions: {
            handleContextMenu,
            addItem,
            showForm,
            onDragEnd,
            onDragStart,
            updateItem,
            removeItem,
        },
    };
};
