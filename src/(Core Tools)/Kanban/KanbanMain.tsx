import { AppEvents, HollowEvent, ICard, IPlugin } from "@type/hollow";
import { render } from "solid-js/web";
import { createRoot, lazy } from "solid-js";
import { ColumnType } from "./types/ColumnType";
import { KanbanManager } from "./KanbanManager";

const Column = lazy(() => import("./components/Column"));

export class KanbanMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();
	private manager: KanbanManager = new KanbanManager();

	async onCreate(name: string): Promise<boolean> {
		this.manager.saveColumn({
			id: name,
			name: name,
			items: [],
			max: 10,
			accent: "#278ee9",
		});
		return true;
	}

	async onDelete(name: string): Promise<boolean> {
		this.manager.removeColumn(name);
		return true;
	}

	async onLoad(card: ICard, app?: HollowEvent<AppEvents>): Promise<boolean> {
		const targetContainer = document.getElementById(card.containerID);
		if (targetContainer && !this.roots.has(card.name)) {
			const data: ColumnType = await this.manager.getColumn(card.name);
			const dispose = createRoot((dispose) => {
				render(
					() => (
						<Column
							card={card}
							data={data}
							app={app}
							manager={this.manager}
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
