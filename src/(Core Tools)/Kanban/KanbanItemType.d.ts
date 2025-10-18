export type KanbanItemType = {
	id: string;
	title: string;
	content: string;
	tags: string[];
	priority?: "low" | "medium" | "high" | "urgent";
	progress: number;
	dates: { createdAt: string; updatedAt?: string };
};
