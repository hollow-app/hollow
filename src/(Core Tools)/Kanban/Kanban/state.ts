import { Accessor, createSignal, Setter } from "solid-js";
import { KanbanProps } from ".";
import type { HelperType } from "./helper";
import { ColumnType } from "../types/ColumnType";
import { ToolMetadata } from "@type/ToolMetadata";
import { CardType, TagType } from "@type/hollow";

export type StateType = {
	listDiv: HTMLDivElement;
	kanban: Accessor<ColumnType>;
	setKanban: Setter<ColumnType>;
	activeItem: Accessor<string>;
	setActiveItem: Setter<string>;
	selectedGroup: Accessor<string[]>;
	setSelectedGroup: Setter<string[]>;
	meta: Accessor<CardType>;
	setMeta: Setter<CardType>;
	hollowTags: Accessor<TagType[]>;
	setHollowTags: Setter<TagType[]>;
};

export const createKanbanState = (
	props: KanbanProps,
	helper?: HelperType,
): StateType => {
	let listDiv: HTMLDivElement;
	const [kanban, setKanban] = createSignal(props.data);
	const [activeItem, setActiveItem] = createSignal<string | null>(null);
	const [selectedGroup, setSelectedGroup] = createSignal([]);
	const [meta, setMeta] = createSignal<CardType>(
		(props.card.toolEvent.getData("metadata") as ToolMetadata).cards.find(
			(i) => i.data.extra.name === props.card.data.extra.name,
		),
	);

	const [hollowTags, setHollowTags] = createSignal<TagType[]>(
		props.card.app.getData("tags"),
	);
	return {
		listDiv,
		kanban,
		setKanban,
		activeItem,
		setActiveItem,
		selectedGroup,
		setSelectedGroup,
		meta,
		setMeta,
		hollowTags,
		setHollowTags,
	};
};

