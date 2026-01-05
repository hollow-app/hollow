export type Character = {
	name: string;
	bio: string;
	title?: string;
	avatar?: string;
	banner?: string;
	level?: number;
	xp?: number;
	achievements?: string[];
	titles: { title: string; rarity: string }[];
	meta?: {
		id: string;
		icon: string;
		label: string;
		value: any;
		color?: string;
	}[];
};
