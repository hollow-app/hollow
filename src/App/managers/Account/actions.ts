import { Events, CharacterState } from "./types";

export const addAchievement = (achievement: string): Events => ({
	domain: "account",
	type: "add-achievement",
	achievement,
});

export const addXp = (amount: number): Events => ({
	domain: "account",
	type: "add-xp",
	amount,
});

export const levelUp = (amount: number = 1): Events => ({
	domain: "account",
	type: "level-up",
	amount,
});

export const updateField = <K extends keyof CharacterState>(
	key: K,
	value: any,
): Events => ({
	domain: "account",
	type: "update-field",
	key,
	value,
});

export const setMeta = (props: {
	id: string;
	icon: string;
	label: string;
	value: any;
	color?: string;
}): Events => ({
	domain: "account",
	type: "set-meta",
	props,
});

export const removeMeta = (id: string): Events => ({
	domain: "account",
	type: "remove-meta",
	id,
});
