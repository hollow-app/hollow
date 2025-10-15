import { DataBase, HollowEvent, ICard, IPlugin } from "hollow-api";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";
import { NotebookType } from "./NotebookType";
import { NotebookManager } from "./NotebookManager";

const Notebook = lazy(() => import("./Notebook"));

export class NotebookMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();
	private notebookManager = new NotebookManager();

	async onCreate(name: string): Promise<boolean> {
		const book: NotebookType = {
			id: name,
			name: name,
			last: null,
			structure: defaultStruture,
		};
		this.notebookManager.addNotebook(book);
		return true;
	}

	async onDelete(name: string): Promise<boolean> {
		this.notebookManager.deleteNotebook(name);
		return true;
	}

	async onLoad(card: ICard, app?: HollowEvent): Promise<boolean> {
		const book: NotebookType = {
			...(await this.notebookManager.getNotebook(card.name)),
			notes: await this.notebookManager.getNotesForNotebook(card.name),
		};

		const targetContainer = document.getElementById(card.containerID);
		if (targetContainer && !this.roots.has(card.name)) {
			const dispose = createRoot((dispose) => {
				render(
					() => (
						<Notebook
							card={card}
							noteBook={book}
							app={app}
							manager={this.notebookManager}
						/>
					),
					targetContainer,
				);
				return dispose;
			});

			this.roots.set(card.name, dispose);
		}

		return true;
	}

	onUnload(name: string): void {
		const dispose = this.roots.get(name);
		if (dispose) {
			dispose();
			this.roots.delete(name);
		}
	}
}

const defaultStruture = `# Title

**Date:** YYYY-MM-DD  

## Summary
A brief overview of the note.

## Details
Expand on the topic with relevant information.

## To-Do / Action Items
- [ ] Task 1  
- [ ] Task 2  

## References / Links
- [Example Link](https://example.com)
`;
