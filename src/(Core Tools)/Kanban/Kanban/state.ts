import { Accessor, createSignal, Setter } from "solid-js";
import { KanbanProps } from ".";
import type { HelperType } from "./helper";
import { ColumnType } from "../types/ColumnType";
import { ToolMetadata } from "@type/ToolMetadata";
import { CardType, TagType } from "@type/hollow";
import { hollow } from "hollow";

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
		(helper?.toolEvents.getData("metadata") as ToolMetadata).cards.find(
			(i) => i.data.name === props.card.data.name,
		),
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
	};
};
