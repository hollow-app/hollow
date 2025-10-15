import { EntryData } from "@type/EntryData";

export class EntryManager {
	public entries: EntryData[];
	constructor() {
		this.entries = JSON.parse(
			localStorage.getItem(
				`${window.realmManager.currentRealmId}-entry`,
			) ?? "[]",
		);
		window.hollowManager.emit("entries", this.entries);
	}
	public receiveEntry(entry: EntryData) {
		let index = this.entries.findIndex((i) => i.id === entry.id);
		const date = new Date().toISOString();
		if (index !== -1) {
			const prev = this.entries[index];
			this.entries[index] = {
				...entry,
				source: {
					...entry.source,
					icon: prev.source.icon,
				},
				createdAt: prev.createdAt,
				modifiedAt: date,
			};
		} else {
			this.entries.push({
				...entry,
				source: {
					...entry.source,
					icon:
						entry.source.icon ??
						window.toolManager
							.getHand()
							.find((i) => i.name === entry.source.tool).icon,
				},
				createdAt: date,
				modifiedAt: date,
			});
		}
		this.update();
	}
	public removeEntry(id: string | string[]) {
		const ids = typeof id === "string" ? [id] : id;
		this.entries = this.entries.filter((i) => !ids.includes(i.id));
		this.update();
	}
	private update() {
		localStorage.setItem(
			`${window.realmManager.currentRealmId}-entry`,
			JSON.stringify(this.entries),
		);
		window.hollowManager.emit("entries", this.entries);
	}
}
