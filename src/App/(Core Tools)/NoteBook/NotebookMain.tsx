import {
	AppApi,
	CardType,
	IPlugin,
	PluginCapability,
	PluginResult,
	ToolApi,
} from "@app/type/hollow";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";
import { NotebookType } from "./NotebookType";
import { NotebookManager } from "./NotebookManager";

const Notebook = lazy(() => import("./Notebook"));

export class NotebookMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();

	constructor(_, toolEvent: ToolApi) {
		NotebookManager.getSelf().init(toolEvent);
		this.capabilities = [
			{
				meta: {
					name: "notebook",
					version: "1.0.0",
					description:
						"A digital notebook for writing notes, organizing thoughts, and keeping track of ideas.",
				},
				kind: "module",
				handler: {
					onCreate: this.onCreate.bind(this),
					onDelete: this.onDelete.bind(this),
					onLoad: this.onLoad.bind(this),
					onUnload: this.onUnload.bind(this),
				},
			},
		] as PluginCapability[];
	}

	public readonly name: string = "notebook";
	public readonly capabilities: PluginCapability[];

	private async onCreate(card: CardType): Promise<PluginResult> {
		try {
			const book: NotebookType = {
				id: card.id,
				name: card.data.name,
				last: null,
				structure: defaultStruture,
			};
			NotebookManager.getSelf().setNotebook(book);
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to create notebook",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	private async onDelete(card: CardType): Promise<PluginResult> {
		try {
			NotebookManager.getSelf().deleteNotebook(card.id);
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to delete notebook",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	private async onLoad(card: CardType): Promise<PluginResult> {
		try {
			const targetContainer = document.getElementById(card.id);
			if (!targetContainer) {
				return {
					status: false,
					message: `DOM container not found for card id: ${card.id}`,
				};
			}

			if (!this.roots.has(card.id)) {
				const book: NotebookType =
					await NotebookManager.getSelf().getNotebook(
						card.id,
						card.data.name,
					);
				const dispose = createRoot((dispose) => {
					render(
						() => <Notebook card={card} noteBook={book} />,
						targetContainer,
					);
					return dispose;
				});
				this.roots.set(card.id, dispose);
			}

			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to load notebook UI",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	private async onUnload(id: string): Promise<PluginResult> {
		try {
			const dispose = this.roots.get(id);
			if (dispose) {
				dispose();
				this.roots.delete(id);
			}
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to unload notebook resources",
				error: error instanceof Error ? error : undefined,
			};
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
