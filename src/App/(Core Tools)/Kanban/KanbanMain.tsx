import {
	CardType,
	HollowEvent,
	IPlugin,
	PluginCapability,
	PluginResult,
	ToolEvents,
	ToolApi,
} from "@app/type/hollow";
import { render } from "solid-js/web";
import { createRoot, lazy } from "solid-js";
import { ColumnType } from "./types/ColumnType";
import { KanbanManager } from "./KanbanManager";

const Column = lazy(() => import("./Kanban"));

export class KanbanMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();

	constructor(_, toolEvent: ToolApi) {
		KanbanManager.getSelf().init(toolEvent);
		this.capabilities = [
			{
				kind: "module",
				handler: {
					onCreate: this.onCreate.bind(this),
					onDelete: this.onDelete.bind(this),
					onLoad: this.onLoad.bind(this),
					onUnload: this.onUnload.bind(this),
				},
				meta: {
					name: "kanban",
					version: "1.0.0",
					description:
						"A kanban board for task management, allowing organization of tasks in different stages.",
				},
			},
		] as any;
	}

	public readonly name = "kanban";
	public readonly capabilities: PluginCapability[];

	private async onCreate(card: CardType): Promise<PluginResult> {
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

	private async onDelete(card: CardType): Promise<PluginResult> {
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
				message: "Failed to unload kanban resources",
				error: error instanceof Error ? error : undefined,
			};
		}
	}
}
