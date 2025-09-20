import { DataBase, HollowEvent, ICard, IPlugin } from "hollow-api";
import { render } from "solid-js/web";
import { createRoot, lazy } from "solid-js";

const Profile = lazy(() => import("./Profile"));

export type ProfileData = {
        name: string;
        bio: string;
        img: string;
        status?: "available" | "busy" | "away";
        meta?: {
                id: string;
                icon: string;
                label: string;
                value: any;
        }[];
};

export class ProfileMain implements IPlugin {
        private db: DataBase = null;
        private roots: Map<string, () => void> = new Map();

        constructor(db?: DataBase) {
                this.db = db;
        }

        async onCreate(name: string): Promise<boolean> {
                this.db.putData(name, {
                        name: "User",
                        bio: "Explore Hollow",
                        img: null,
                        status: "available",
                        meta: [
                                {
                                        id: "first-meta",
                                        icon: "AtSign",
                                        label: "Hollow",
                                        value: "user",
                                },
                        ],
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
                const data: ProfileData = (await this.db.getData(
                        card.name,
                )) ?? {
                        name: "User",
                        bio: "Explore Hollow",
                        img: null,
                };
                if (targetContainer && !this.roots.has(card.name)) {
                        const dispose = createRoot((dispose) => {
                                render(
                                        () => (
                                                <Profile
                                                        card={card}
                                                        app={app}
                                                        data={data}
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
