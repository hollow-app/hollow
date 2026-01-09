import { NoteType } from "./NoteType";

export type NotebookType = {
	id: string;
	name: string;
	last: string | null;
	notes?: NoteType[];
	structure: string;
};
