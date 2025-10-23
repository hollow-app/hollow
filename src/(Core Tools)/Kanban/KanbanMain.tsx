import { AppEvents, HollowEvent, ICard, IPlugin } from "@type/hollow";
import { render } from "solid-js/web";
import { createRoot, lazy } from "solid-js";
import { ColumnType } from "./types/ColumnType";
import { KanbanManager } from "./KanbanManager";

const Column = lazy(() => import("./components/Column"));

export class KanbanMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();

	async onCreate(card: ICard): Promise<boolean> {
		KanbanManager.getSelf().saveColumn({
			id: card.id,
			name: card.name,
			items: [],
			max: 10,
			accent: "#278ee9",
		});
		return true;
	}

	async onDelete(card: ICard): Promise<boolean> {
		KanbanManager.getSelf().removeColumn(card.id);
		return true;
	}

	async onLoad(card: ICard): Promise<boolean> {
		const targetContainer = document.getElementById(card.id);
		if (targetContainer && !this.roots.has(card.name)) {
			const data: ColumnType = await KanbanManager.getSelf().getColumn(
				card.id,
			);
			const dispose = createRoot((dispose) => {
				render(
					() => <Column card={card} data={data} />,
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
