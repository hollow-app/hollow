export type NoteType = {
	notebookId: string;
	id: string | null;
	title: string;
	content: string;
	tags: string[];
	dates?: { created: string; modified: string };
	banner?: string;
};
