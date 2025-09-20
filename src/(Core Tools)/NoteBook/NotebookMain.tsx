import { DataBase, HollowEvent, ICard, IPlugin } from "hollow-api";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";

const Notebook = lazy(() => import("./Notebook"));

export interface NoteType {
        id: string;
        title: string;
        content: string;
        tags: string[];
        dates?: { created: string; modified: string };
        banner?: string;
}
export interface NoteBookType {
        name: string;
        last: string | null;
        fontSize: number;
        notes?: NoteType[];
        structure: string;
}

export class NotebookMain implements IPlugin {
        private roots: Map<string, () => void> = new Map();
        private db: DataBase = null;

        constructor(db?: DataBase) {
                this.db = db;
        }

        async onCreate(name: string): Promise<boolean> {
                const book: NoteBookType = {
                        name: name,
                        notes: [],
                        last: null,
                        fontSize: 17,
                        structure: defaultStruture,
                };
                this.db.putData(name, book);
                return true;
        }

        async onDelete(name: string): Promise<boolean> {
                this.db.deleteData(name);
                return true;
        }

        async onLoad(card: ICard, app?: HollowEvent): Promise<boolean> {
                const book: NoteBookType = await this.db.getData(card.name);

                const targetContainer = document.getElementById(
                        card.containerID,
                );
                if (targetContainer && !this.roots.has(card.name)) {
                        const dispose = createRoot((dispose) => {
                                render(
                                        () => (
                                                <Notebook
                                                        card={card}
                                                        noteBook={book}
                                                        app={app}
                                                        db={this.db}
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
