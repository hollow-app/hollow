import { KanbanItemType } from "./KanbanItemType";

export type KanbanColumnType = {
	id: string;
	name: string;
	accent: string;
	max: number;
	items: KanbanItemType[];
};
