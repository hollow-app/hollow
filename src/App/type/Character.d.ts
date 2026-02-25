/**
 * Character-related type definitions
 */

export type CharacterEntityMeta = {
	id: string;
	source: string;
	createdAt: string;
};
export type Achievement = CharacterEntityMeta & {
	label: string;
	description?: string;
	icon?: string;
};
export type Title = CharacterEntityMeta & {
	label: string;
	rarity: "common" | "rare" | "epic" | "legendary" | string;
};
export type CharacterIdentity = {
	name: string;
	bio: string;
	avatar: string;
	banner: string;
	lastUpdatedAt: string;
};
export type Level = {
	total: number;
	xp: number;
	lastUpdatedAt: string;
};
export type Character = {
	identity: CharacterIdentity;
	title: Title;
	level: Level; // if ( (deltaXP + xp.total) >= (level + 1)*100 ) then { level++; and xp.total = ((deltaXP + xp.total) - (level + 1)*100); }
	achievements: Achievement[];
	titles: Title[];
	meta?: {
		id: string;
		icon: string;
		label: string;
		value: any;
		color?: string;
	}[];
};
