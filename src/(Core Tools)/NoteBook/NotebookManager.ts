import fm from "front-matter";
import { NotebookType } from "./NotebookType";
import { CardFs, HollowEvent, IStore, ToolEvents } from "@type/hollow";
import { NoteType } from "./NoteType";

export class NotebookManager {
	private store: IStore = null;
	private toolEvent: HollowEvent<ToolEvents>;
	private static self: NotebookManager;

	static getSelf() {
		if (!this.self) {
			this.self = new NotebookManager();
		}
		return this.self;
	}

	private constructor() {}
	init(toolEvent: HollowEvent<ToolEvents>) {
		this.toolEvent = toolEvent;
		this.store = this.toolEvent.getCurrentData("config");
	}

	rebuildMarkdown(obj: NoteType) {
		if (!obj || !obj.frontmatter || !obj.body) {
			return obj.body || "";
		}
		return `---\n${obj.frontmatter}\n---\n${obj.body}`;
	}

	// fs
	setNotebook(notebook: NotebookType) {
		const { notes, ...book } = notebook;
		this.store.set(notebook.id, book);
	}

	deleteNotebook(notebookId: string) {
		this.store.remove(notebookId);
	}

	async getNotebook(id: string, cardName: string): Promise<NotebookType> {
		const entries = await this.getCardFs(cardName).readDir();
		const notes = await Promise.all(
			entries
				.filter((i) => i.isFile)
				.map(async (i) => fm(await this.getNote(cardName, i.name))),
		);
		return { ...this.store.get(id), notes };
	}

	async setNote(
		cardName: string,
		title: string,
		content: string,
		newTitle?: string,
	): Promise<void> {
		if (newTitle && title !== newTitle) {
			await this.getCardFs(cardName).rename(
				`${title}.md`,
				`${newTitle}.md`,
			);
		}
		await this.getCardFs(cardName).writeFile(
			`${newTitle ?? title}.md`,
			content,
		);
	}

	async deleteNote(cardName: string, title: string): Promise<void> {
		await this.getCardFs(cardName).remove(`${title}.md`);
	}

	async getNote(cardName: string, title: string): Promise<string> {
		return this.getCardFs(cardName).readFile(title);
	}
	//
	private getCardFs(cardName: string): CardFs {
		return this.toolEvent.getCurrentData("cards-fs")[cardName];
	}
}
