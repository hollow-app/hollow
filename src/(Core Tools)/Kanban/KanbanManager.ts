import { ToolDataBase } from "@managers/ToolDataBase";
import { ColumnType } from "./types/ColumnType";
import { DataBase, DataBaseRequest } from "@type/hollow";

export class KanbanManager {
	private db: DataBase = null;
	private static self: KanbanManager;

	static getSelf() {
		if (!this.self) {
			this.self = new KanbanManager();
		}
		return this.self;
	}

	constructor() {
		const request: DataBaseRequest = {
			pluginName: "kanbanDB",
			version: 1,
			stores: [
				{
					name: "columns",
				},
			],
			callback: (db) => {
				this.db = db;
			},
		};
		window.hollowManager.emit("database", request);
	}

	async getColumn(columnId: string): Promise<ColumnType | null> {
		const column = await this.db.getData<ColumnType>("columns", columnId);
		return column ?? null;
	}

	async saveColumn(column: ColumnType): Promise<void> {
		await this.db.putData("columns", column.id, column);
	}
	async clearColumn(column: ColumnType): Promise<void> {
		const emptyColumn = {
			...column,
			items: [],
		};
		await this.saveColumn(emptyColumn);
	}

	async removeColumn(columnId: string): Promise<void> {
		await this.db.deleteData("columns", columnId);
	}
}
