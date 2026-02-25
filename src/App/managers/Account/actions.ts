import { Achievement } from "@app/type/Character";
import { Events, AccountState } from "./types";

export const addAchievement = (achievement: Achievement): Events => ({
	domain: "account",
	type: "add-achievement",
	achievement,
});

export const addXp = (amount: number): Events => ({
	domain: "account",
	type: "add-xp",
	amount,
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
