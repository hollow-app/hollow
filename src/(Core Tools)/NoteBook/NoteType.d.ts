export type NoteType = {
	attributes: {
		id: string;
		title: string;
		tags?: string;
		banner?: string;
	};
	body: string;
	bodyBegin?: number;
	frontmatter?: string;
	newNote?: boolean;
};
