export type Character = {
	username: string;
	bio: string;
	avatar?: string;
	title?: string;
	banner?: string;
	level?: number;
	xp?: number;
	achievements?: string[];
	titles: string[];
	meta?: {
		id: string;
		icon: string;
		label: string;
		value: any;
		color?: string;
	}[];
};
