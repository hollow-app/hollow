import { Character } from "@type/Character";
import { hollow } from "hollow";
import { ReactiveManager } from "./ReactiveManager";
import DEFAULT from "@assets/configs/character.json?raw";

export class CharacterManager extends ReactiveManager<Character> {
	constructor() {
		const saved = localStorage.getItem("character") ?? DEFAULT;
		super(JSON.parse(saved));
		this.subscribe((state) => {
			localStorage.setItem("character", JSON.stringify(state));
		});
		hollow.events.on(
			"character-add-achievement",
			this.addAchievement.bind(this),
		);
		hollow.events.on("character-add-title", this.addTitle.bind(this));
		hollow.events.on("character-add-xp", this.addXp.bind(this));
	}

	addTitle(title: string) {
		const state = this.get;
		if (!state.titles.includes(title)) {
			this.set = { titles: [...state.titles, title] };
			hollow.events.emit("alert", {
				title: "Title Gained",
				message: title,
			});
		}
	}
	addAchievement(achievement: string) {
		const state = this.get;
		if (!state.achievements.includes(achievement)) {
			this.set = { achievements: [...state.achievements, achievement] };
			hollow.events.emit("alert", {
				title: "Achievement Gained",
				message: achievement,
			});
		}
	}

	addXp(amount: number) {
		let { xp, level } = this.get;
		xp += amount;
		let lvlAmount = 0;
		while (xp >= (level + lvlAmount) * 100) {
			xp -= (level + lvlAmount) * 100;
			lvlAmount++;
		}
		this.set = { xp };
		if (lvlAmount > 0) this.levelUp(lvlAmount);
	}

	levelUp(amount: number = 1) {
		this.set = { level: this.get.level + amount };
	}

	updateField<K extends keyof Character>(key: K, value: any) {
		this.set = { [key]: value } as Partial<Character>;
	}

	setMeta(props: any) {
		const state = this.get;
		const idx = state.meta.findIndex((m) => m.id === props.id);
		const newMeta = [...state.meta];
		if (idx >= 0) {
			newMeta[idx] = { ...newMeta[idx], ...props };
		} else {
			newMeta.push(props);
		}
		this.set = { meta: newMeta };
	}
}
