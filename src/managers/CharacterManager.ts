import { Character } from "@type/Character";
import { hollow } from "hollow";
import DEFAULT from "@assets/configs/account.json?raw";
import { createStore, SetStoreFunction, Store, unwrap } from "solid-js/store";

export class CharacterManager {
	private characterStore: [get: Character, set: SetStoreFunction<Character>];
	private static self: CharacterManager;

	public async start() {
		const item = localStorage.getItem("character");
		this.characterStore = createStore(JSON.parse(item ?? DEFAULT));
		hollow.events.on("character-add-achievement", this.addAchievement);
		hollow.events.on("character-add-title", this.addTitle);
		hollow.events.on("character-add-xp", this.addXp);
	}
	static getSelf() {
		if (!this.self) {
			this.self = new CharacterManager();
		}
		return this.self;
	}

	public getCharacter(): Character {
		return this.characterStore[0];
	}

	public setCharacter(props: Partial<Character>) {
		this.characterStore[1]((prev: Character) => ({ ...prev, ...props }));
		this.update();
	}

	public updateField<K extends keyof Character>(
		key: K,
		value: Character[K],
	): void {
		this.characterStore[1](key, value);
		this.update();
	}

	public addTitle(title: string) {
		const character = this.getCharacter();
		if (!character.titles.includes(title)) {
			this.characterStore[1]("titles", (l) => [...l, title]);
			hollow.events.emit("alert", {
				title: "Title Gained",
				message: title,
			});
			this.update();
		}
	}

	public addAchievement(achievement: string): void {
		const character = this.getCharacter();
		if (!character.achievements.includes(achievement)) {
			this.characterStore[1]("achievements", (l) => [...l, achievement]);
			hollow.events.emit("alert", {
				title: "Achievement Gained",
				message: achievement,
			});
			this.update();
		}
	}

	public setMeta(props: any): void {
		const character = this.getCharacter();
		const idx = character.meta.findIndex((m) => m.id === props.id);
		if (idx >= 0) {
			this.characterStore[1]("meta", idx, (p) => ({ ...p, ...props }));
		} else {
			this.characterStore[1]("meta", (l) => [...l, props]);
		}
		this.update();
	}

	public levelUp(amount: number = 1): void {
		this.characterStore[1](
			"level",
			(this.getCharacter().level ?? 1) + amount,
		);
		this.update();
	}

	public addXp(amount: number): void {
		const character = this.getCharacter();
		let xp = (character.xp ?? 0) + amount;
		let lvlAmount = 0;
		while (xp >= (character.level + lvlAmount) * 100) {
			xp -= (character.level + lvlAmount) * 100;
			lvlAmount++;
		}
		this.characterStore[1]("xp", xp);
		if (lvlAmount > 0) {
			this.levelUp(lvlAmount);
		} else {
			this.update();
		}
	}

	private async update() {
		localStorage.setItem(
			"character",
			JSON.stringify(unwrap(this.getCharacter())),
		);
	}
}
