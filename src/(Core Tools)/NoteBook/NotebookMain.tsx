import { HollowEvent, ICard, IPlugin, IStore, ToolEvents } from "@type/hollow";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";
import { NotebookType } from "./NotebookType";
import { NotebookManager } from "./NotebookManager";

const Notebook = lazy(() => import("./Notebook"));

export class NotebookMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();

	constructor(toolEvent: HollowEvent<ToolEvents>) {
		NotebookManager.getSelf().init(toolEvent);
	}
	async onCreate(card: ICard): Promise<boolean> {
		const book: NotebookType = {
			id: card.id,
			name: card.name,
			last: null,
			structure: defaultStruture,
		};
		NotebookManager.getSelf().setNotebook(book);
		return true;
	}

	async onDelete(card: ICard): Promise<boolean> {
		NotebookManager.getSelf().deleteNotebook(card.id);
		return true;
	}

	async onLoad(card: ICard): Promise<boolean> {
		const targetContainer = document.getElementById(card.id);
		if (targetContainer && !this.roots.has(card.id)) {
			const book: NotebookType =
				await NotebookManager.getSelf().getNotebook(card.id, card.name);
			const dispose = createRoot((dispose) => {
				render(
					() => <Notebook card={card} noteBook={book} />,
					targetContainer,
				);
				return dispose;
			});

			this.roots.set(card.id, dispose);
		} else {
			return false;
		}

		return true;
	}

	onUnload(id: string): void {
		const dispose = this.roots.get(id);
		if (dispose) {
			dispose();
			this.roots.delete(id);
		}
	}
}

const defaultStruture = `---
title: Note
tags: hollow, nature
---

# Title

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
