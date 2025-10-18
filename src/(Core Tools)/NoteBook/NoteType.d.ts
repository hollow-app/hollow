export type NoteType = {
	notebookId: string;
	id: string | null;
	title: string;
	content: string;
	tags: string[];
	dates: { createdAt: string; updatedAt?: string };
	banner?: string;
};
