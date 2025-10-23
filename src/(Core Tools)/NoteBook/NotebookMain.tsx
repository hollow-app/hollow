import { ICard, IPlugin } from "@type/hollow";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";
import { NotebookType } from "./NotebookType";
import { NotebookManager } from "./NotebookManager";

const Notebook = lazy(() => import("./Notebook"));

export class NotebookMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();

	async onCreate(card: ICard): Promise<boolean> {
		const book: NotebookType = {
			id: card.id,
			name: card.name,
			last: null,
			structure: defaultStruture,
		};
		NotebookManager.getSelf().addNotebook(book);
		return true;
	}

	async onDelete(card: ICard): Promise<boolean> {
		NotebookManager.getSelf().deleteNotebook(card.id);
		return true;
	}

	async onLoad(card: ICard): Promise<boolean> {
		const targetContainer = document.getElementById(card.id);
		if (targetContainer && !this.roots.has(card.name)) {
			const book: NotebookType = {
				...(await NotebookManager.getSelf().getNotebook(card.id)),
				notes: await NotebookManager.getSelf().getNotesForNotebook(
					card.id,
				),
			};
			const dispose = createRoot((dispose) => {
				render(
					() => <Notebook card={card} noteBook={book} />,
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
