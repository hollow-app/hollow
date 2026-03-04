import fm from "front-matter";
import { NotebookType } from "./NotebookType";
import { AppApi, CardFs, IStore, ToolApi } from "@app/type/hollow";
import { NoteType } from "./NoteType";
import { getToolStore } from "@app/managers/Module/effects";

export class NotebookManager {
	private store: IStore = null;
	private toolEvent: ToolApi;
	private static self: NotebookManager;

	static getSelf() {
		if (!this.self) {
			this.self = new NotebookManager();
		}
		return this.self;
	}

	private constructor() {}

	private getStore() {
		if (!this.store) {
			this.store = getToolStore("notebook");
		}
		return this.store;
	}
	init(toolEvent: ToolApi) {
		this.toolEvent = toolEvent;
	}

	getEvents() {
		return this.toolEvent;
	}

	rebuildMarkdown(obj: NoteType) {
		if (!obj || !obj.frontmatter || !obj.body) {
			return obj.body || "";
		}
		return `---\n${Object.entries(obj.attributes)
			.map(([k, v]) => `${k}: ${v}`)
			.join("\n")}\n---\n${obj.body}`;
	}

	// fs
	setNotebook(notebook: NotebookType) {
		const { notes, ...book } = notebook;
		this.getStore().set(notebook.id, book);
	}

	deleteNotebook(notebookId: string) {
		this.getStore().remove(notebookId);
	}

	async getNotebook(id: string, cardName: string): Promise<NotebookType> {
		const entries = await this.getCardFs(cardName).readDir();
		const notes: NoteType[] = await Promise.all(
			entries
				.filter((i) => !i.is_dir)
				.map(async (i) => ({
					...fm(await this.getNote(cardName, i.name)),
					title: i.name.split(".md")[0],
				})),
		);
		const notebook: NotebookType = {
			...this.getStore().get(id),
			notes,
		};
		return notebook;
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
		return this.toolEvent.emit(
			"card-fs",
			{ cardName },
			{ source: "source" },
		);
	}
}
