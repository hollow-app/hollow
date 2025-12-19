import {
	CardType,
	HollowEvent,
	IPlugin,
	PluginResult,
	ToolEvents,
} from "@type/hollow";
import { render } from "solid-js/web";
import { createRoot, lazy } from "solid-js";
import { ColumnType } from "./types/ColumnType";
import { KanbanManager } from "./KanbanManager";

const Column = lazy(() => import("./Kanban"));

export class KanbanMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();

	constructor(_, toolEvent: HollowEvent<ToolEvents>) {
		KanbanManager.getSelf().init(toolEvent);
	}

	public async onCreate(card: CardType): Promise<PluginResult> {
		try {
			KanbanManager.getSelf().saveColumn({
				id: card.id,
				name: card.data.name,
				items: [],
				max: 10,
				accent: "#278ee9",
			});
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to create kanban column",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	public async onDelete(card: CardType): Promise<PluginResult> {
		try {
			KanbanManager.getSelf().removeColumn(card.id);
			return { status: true };
		} catch (error) {
			return {
				status: false,
				message: "Failed to delete kanban column",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	public async onLoad(card: CardType): Promise<PluginResult> {
		try {
			const targetContainer = document.getElementById(card.id);
			if (!targetContainer) {
				return {
					status: false,
					message: `DOM container not found for card id: ${card.id}`,
				};
			}

			if (!this.roots.has(card.id)) {
				const data: ColumnType =
					await KanbanManager.getSelf().getColumn(card.id);
				const dispose = createRoot((dispose) => {
					render(
						() => <Column card={card} data={data} />,
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
				message: "Failed to load kanban UI",
				error: error instanceof Error ? error : undefined,
			};
		}
	}

	public async onUnload(id: string): Promise<PluginResult> {
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
				message: "Failed to unload kanban resources",
				error: error instanceof Error ? error : undefined,
			};
		}
	}
}
