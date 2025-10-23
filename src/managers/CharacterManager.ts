import { Character } from "@type/Character";
import { Setter } from "solid-js";

export class CharacterManager {
	private character: Character = {
		username: "New Adventurer",
		level: 1,
		xp: 5,
		avatar: null,
		banner: null,
		title: "Elder",
		bio: "Welcome to Hollow!",
		achievements: ["🌀 First Step"],
		titles: ["Elder", "The Original Few"],
		meta: [
			{
				id: "example-1",
				label: "Study",
				icon: "Leaf",
				value: 90,
				color: "#3BA936",
			},
		],
	};
	public setUiCharacter: Setter<Character> = null;
	private static self: CharacterManager;
	private db: Promise<IDBDatabase>;

	public async start() {
		this.db = this.openDB();
		const saved = await this.getFromDB<Character>();
		if (saved) {
			this.character = saved;
		} else {
			this.update();
		}
		window.hollowManager.on(
			"character-add-achievement",
			this.addAchievement,
		);
		window.hollowManager.on("character-level-up", this.levelUp);
		window.hollowManager.on("character-add-xp", this.addXp);
	}
	static getSelf() {
		if (!this.self) {
			this.self = new CharacterManager();
		}
		return this.self;
	}

	public getCharacter(): Character {
		return this.character;
	}

	public setCharacter(props: Partial<Character>) {
		this.character = { ...this.character, ...props };
		this.update();
	}

	public updateField<K extends keyof Character>(
		key: K,
		value: Character[K],
	): void {
		this.character[key] = value;
		this.update();
	}

	public addAchievement(achievement: string): void {
		if (!this.character.achievements)
			this.character.achievements = [achievement];
		if (!this.character.achievements.includes(achievement)) {
			this.character.achievements.push(achievement);
			this.update();
		}
	}

	public setMeta(props: any): void {
		if (!this.character.meta) this.character.meta = [];
		const idx = this.character.meta.findIndex((m) => m.id === props.id);
		if (idx >= 0) {
			this.character.meta[idx] = {
				...this.character.meta[idx],
				...props,
			};
		} else {
			this.character.meta.push({ ...props });
		}
		this.update();
	}

	public levelUp(amount: number = 1): void {
		this.character.level = (this.character.level ?? 1) + amount;
		this.update();
	}

	public addXp(amount: number): void {
		const xp = (this.character.xp ?? 0) + amount;
		if (xp === this.character.level * 100) {
			this.character.xp = 0;
			this.levelUp();
		} else {
			this.character.xp = xp;
			this.update();
		}
	}

	private async update(): Promise<void> {
		if (this.setUiCharacter) {
			this.setUiCharacter({ ...this.character });
		}
		await this.setInDB(this.character);
	}

	/* -------------- db -------------- */
	// account -> character -> account
	private openDB(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("account", 1);
			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains("character")) {
					db.createObjectStore("character");
				}
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	private async getFromDB<T>(): Promise<T | null> {
		const db = await this.db;
		return new Promise((resolve, reject) => {
			const tx = db.transaction("character", "readonly");
			const store = tx.objectStore("character");
			const req = store.get("account");
			req.onsuccess = () => resolve(req.result ?? null);
			req.onerror = () => reject(req.error);
		});
	}

	private async setInDB<T>(value: T): Promise<void> {
		const db = await this.db;
		return new Promise((resolve, reject) => {
			const tx = db.transaction("character", "readwrite");
			const store = tx.objectStore("character");
			const req = store.put(value, "account");
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	}
}
