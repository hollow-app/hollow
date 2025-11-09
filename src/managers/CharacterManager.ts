import { Character } from "@type/Character";
import { hollow } from "hollow";
import { Setter } from "solid-js";
import DEFAULT from "@assets/configs/account.json?raw";
import { SecretsManager } from "./SecretsManager";
import { ActivityIcon } from "lucide-solid";

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
	private static self: CharacterManager;

	public async start() {
		if (!localStorage.getItem("character")) {
			this.character = JSON.parse(DEFAULT);
		} else {
			this.character =
				(await SecretsManager.getSelf().decryptObject(
					localStorage.getItem("character"),
				)) ?? JSON.parse(DEFAULT);
		}
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

	public addTitle(title: string) {
		if (!this.character.titles.includes(title)) {
			this.character.titles.push(title);
			hollow.events.emit("alert", {
				title: "Title Gained",
				message: title,
			});
			this.update();
		}
	}

	public addAchievement(achievement: string): void {
		if (!this.character.achievements.includes(achievement)) {
			this.character.achievements.push(achievement);
			hollow.events.emit("alert", {
				title: "Achievement Gained",
				message: achievement,
			});
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
		let xp = (this.character.xp ?? 0) + amount;
		let lvlAmount = 0;
		while (xp >= (this.character.level + lvlAmount) * 100) {
			xp -= (this.character.level + lvlAmount) * 100;
			lvlAmount++;
		}
		this.character.xp = xp;
		if (lvlAmount > 0) {
			this.levelUp(lvlAmount);
		} else {
			this.character.xp = xp;
			this.update();
		}
	}

	private async update() {
		hollow.pevents.emit("ui-set-character", () => this.character);
		const encrypted = await SecretsManager.getSelf().encryptObject(
			this.character,
		);
		localStorage.setItem("character", encrypted);
	}
}
