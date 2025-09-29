import { HandType } from "@type/HandType";

// TODO used only when the app opens for the first time
// or when a new realm is created, taking space fo rno reason
export const initialStack: HandType[] = [
	{
		version: "1.0.0",
		name: "image",
		title: "Image",
		description:
			"An image management tool for viewing, organizing, and editing pictures.",
		author: "Hollow Team",
		authorUrl: "https://github.com/hollow-app",
		icon: "Image",
		dbVersion: 1,
		cards: [],
		signed: true,
	},
	{
		version: "1.0.0",
		name: "notebook",
		title: "NoteBook",
		description:
			"A digital notebook for writing notes, organizing thoughts, and keeping track of ideas.",
		author: "Hollow Team",
		authorUrl: "https://github.com/hollow-app",
		icon: "NotebookTabs",
		dbVersion: 1,
		cards: [],
		signed: true,
	},
	{
		version: "1.0.0",
		name: "kanban",
		title: "Kanban",
		description:
			"A kanban board for task management, allowing organization of tasks in different stages.",
		author: "Hollow Team",
		authorUrl: "https://github.com/hollow-app",
		icon: "Kanban",
		dbVersion: 1,
		cards: [],
		signed: true,
	},
	{
		version: "1.0.0",
		name: "embed",
		title: "Embed",
		description:
			"A tool for embedding external content, including websites, videos, and widgets.",
		author: "Hollow Team",
		authorUrl: "https://github.com/hollow-app",
		icon: "CodeXml",
		dbVersion: 1,
		cards: [],
		signed: true,
	},
];
