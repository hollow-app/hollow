export type NoteType = {
	notebookId: string;
	id: string | null;
	title: string;
	tags?: string[];
	dates: { createdAt: string; updatedAt?: string };
	banner?: string;
	attributes?: {
		tags?: string[];
		banner?: string;
	};
	body: string;
	bodyBegin?: number;
	frontmatter: string;
};
