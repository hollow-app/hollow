import { ColumnType } from "./types/ColumnType";
import {
	HollowEvent,
	AppEvents,
	InsightType,
	AppEventReturns,
	ToolEvents,
	IStore,
	ToolApi,
} from "@type/hollow";
import { ItemType } from "./types/ItemType";
import { timeDifferenceMin } from "@utils/manipulation/strings";
import { hollow } from "../../../hollow";

export class KanbanManager {
	private store: IStore = null;
	private toolEvent: ToolApi;
	private static self: KanbanManager;

	static getSelf() {
		if (!this.self) {
			this.self = new KanbanManager();
		}
		return this.self;
	}

	private constructor() {}

	init(toolEvent: ToolApi) {
		this.toolEvent = toolEvent;
		this.store = this.toolEvent.getData("config");
	}

	getEvents() {
		return this.toolEvent;
	}

	async getColumn(columnId: string): Promise<ColumnType | null> {
		return this.store.get(columnId);
	}

	async saveColumn(column: ColumnType): Promise<void> {
		this.store.set(column.id, column);
	}
	async clearColumn(column: ColumnType): Promise<void> {
		const emptyColumn = {
			...column,
			items: [],
		};
		await this.saveColumn(emptyColumn);
	}

	async removeColumn(columnId: string): Promise<void> {
		this.store.remove(columnId);
	}

	showInsight(column: ColumnType) {
		const app = hollow.events;
		const items = column.items ?? [];

		const totalItems = items.length;
		const averageProgress =
			totalItems > 0
				? Math.round(
						(items.reduce(
							(s, it) =>
								s +
								(typeof it.progress === "number"
									? it.progress
									: 0),
							0,
						) /
							totalItems) *
							10,
					) / 10
				: 0;

		const latestDate =
			items
				.map((it) => it.dates.updatedAt ?? it.dates.createdAt)
				.filter(Boolean)
				.map((s) => new Date(s))
				.sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

		const priorityOrder: (ItemType["priority"] | "none")[] = [
			"urgent",
			"high",
			"medium",
			"low",
			"none",
		];
		const priorityCounts = this.countOccurrences(
			items,
			(it) => it.priority,
		);

		const allTags = items.flatMap((it) => it.tags ?? []);
		const tagCounts = this.countOccurrences(allTags, (t) => t);

		const summary: {
			label: string;
			value: string | number;
			tooltip?: string;
		}[] = [];

		summary.push({
			label: "Column Name",
			value: column.name,
			tooltip: "The name of the column",
		});

		summary.push({
			label: "Total Items",
			value: totalItems,
			tooltip: "Number of items in this column",
		});

		summary.push({
			label: "Capacity",
			value: `${totalItems}/${column.max}`,
			tooltip: "Current items / max capacity",
		});

		summary.push({
			label: "Average Progress (%)",
			value: averageProgress,
			tooltip: "Average progress across items (0-100%)",
		});

		summary.push({
			label: "Most Recent Update",
			value: latestDate
				? timeDifferenceMin(latestDate.toISOString())
				: "none",
			tooltip: "Most recent updatedAt/createdAt across items (ISO)",
		});
		const uniquePriorityList = Object.keys(priorityCounts).sort(
			(a, b) => priorityCounts[b] - priorityCounts[a],
		);

		for (const p of uniquePriorityList) {
			summary.push({
				label: `Priority : ${p}`,
				value: priorityCounts[p],
				tooltip: `Items with "${p}" priority`,
			});
		}

		const uniqueTagList = Object.keys(tagCounts).sort(
			(a, b) => tagCounts[b] - tagCounts[a],
		);
		for (const tag of uniqueTagList) {
			summary.push({
				label: `Tag : ${tag}`,
				value: tagCounts[tag],
				tooltip: `Number of items tagged "${tag}"`,
			});
		}
		const insight: InsightType = {
			title: `Column :${column.name}`,
			message: "A Summary of a kanban column",
			items: summary,
		};
		app.emit("insight", insight);
	}

	private countOccurrences<T>(arr: T[], keyFn: (v: T) => string | undefined) {
		return arr.reduce<Record<string, number>>((acc, item) => {
			const key = keyFn(item) ?? "none";
			acc[key] = (acc[key] || 0) + 1;
			return acc;
		}, {});
	}
}
