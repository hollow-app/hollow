import { KanbanItemType } from "./Types/ItemTypee";

export type ColumnType = {
	id: string;
	name: string;
	accent: string;
	max: number;
	items: KanbanItemType[];
};
