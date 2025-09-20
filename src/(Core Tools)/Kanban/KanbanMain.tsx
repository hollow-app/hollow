import { DataBase, HollowEvent, ICard, IPlugin } from "hollow-api";
import { render } from "solid-js/web";
import { createRoot, lazy } from "solid-js";

const Kanban = lazy(() => import("./Kanban"));

export type KanbanData = {
        icon: string;
        name: string;
        accent: string;
        max: number;
        items: KanbanItemData[];
};
type KanbanItemData = {
        id: string;
        content: string;
        tags: string[];
};
export class KanbanMain implements IPlugin {
        private db: DataBase = null;
        private roots: Map<string, () => void> = new Map();

        constructor(db?: DataBase) {
                this.db = db;
        }

        async onCreate(name: string): Promise<boolean> {
                this.db.putData(name, {
                        icon: "Apple",
                        name: name,
                        items: [],
                        max: 10,
                        accent: "#278ee9",
                });
                return true;
        }

        async onDelete(name: string): Promise<boolean> {
                this.db.deleteData(name);
                return true;
        }

        async onLoad(card: ICard, app?: HollowEvent): Promise<boolean> {
                const targetContainer = document.getElementById(
                        card.containerID,
                );
                if (targetContainer && !this.roots.has(card.name)) {
                        const data: KanbanData = await this.db.getData(
                                card.name,
                        );
                        const dispose = createRoot((dispose) => {
                                render(
                                        () => (
                                                <Kanban
                                                        card={card}
                                                        db={this.db}
                                                        data={data}
                                                        app={app}
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
