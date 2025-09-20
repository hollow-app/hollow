import { DataBase, HollowEvent, ICard, IPlugin } from "hollow-api";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";

const Embed = lazy(() => import("./Embed"));

export type EmbedData = {
        src: string;
};

export class EmbedMain implements IPlugin {
        private db: DataBase = null;
        private roots: Map<string, () => void> = new Map();

        constructor(db?: DataBase) {
                this.db = db;
        }

        async onCreate(name: string): Promise<boolean> {
                this.db.putData(name, { src: null });
                return true;
        }

        async onDelete(name: string): Promise<boolean> {
                this.db.deleteData(name);
                return true;
        }

        async onLoad(card: ICard, app?: HollowEvent): Promise<boolean> {
                const data: EmbedData = await this.db.getData(card.name);
                const targetContainer = document.getElementById(
                        card.containerID,
                );
                if (targetContainer && !this.roots.has(card.name)) {
                        const dispose = createRoot((dispose) => {
                                render(
                                        () => (
                                                <Embed
                                                        data={data}
                                                        db={this.db}
                                                        app={app}
                                                        card={card}
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
